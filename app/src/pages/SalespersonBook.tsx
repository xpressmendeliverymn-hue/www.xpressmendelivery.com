import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, CheckCircle, Package, Camera, ScanLine, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, catalogApi, storesApi, scheduleApi, ocrApi, uploadApi } from '@/services/api';
import { toast } from 'sonner';

interface ExtractedData {
  storeName?: string;
  storeOrderNumber?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  salespersonName?: string;
  items?: { sku?: string; name: string; quantity: number; price: number }[];
  merchandiseTotal?: number;
  tax?: number;
  total?: number;
  pickupAddress?: string;
  instructions?: string;
  orderDate?: string;
}

export default function SalespersonBook() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [catalog, setCatalog] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ExtractedData | null>(null);
  const [scanError, setScanError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [formImageUrl, setFormImageUrl] = useState('');

  const [form, setForm] = useState({
    customerFirstName: '', customerLastName: '', customerPhone: '', customerEmail: '', customerAddress: '',
    storeName: '', storeOrderNumber: '', itemDescription: '',
    serviceType: 'delivery' as 'delivery' | 'removal',
  });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'salesperson') { navigate('/'); return; }
    catalogApi.list().then(setCatalog);
    storesApi.list().then(setStores);
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (selectedDate) {
      scheduleApi.available(selectedDate).then(setAvailableSlots);
    }
  }, [selectedDate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanResult(null);
    setScanError('');
    setScannedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await ocrApi.extract(file);
      if (result.success && result.data) {
        setScanResult(result.data);
        toast.success(result.source === 'mock' ? 'Demo mode: mock data loaded' : 'Form scanned successfully!');
      } else {
        setScanError(result.error || 'Could not read form');
        toast.error('Scan failed');
      }
    } catch (err: any) {
      setScanError(err.message || 'Scan failed');
      toast.error(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const applyScan = async () => {
    if (!scanResult) return;

    // Upload the scanned form image first
    if (scannedFile) {
      try {
        const uploadRes = await uploadApi.image(scannedFile);
        setFormImageUrl(uploadRes.url);
      } catch (e) {
        console.log('Form image upload skipped');
      }
    }

    setForm((prev) => ({
      ...prev,
      customerFirstName: scanResult.customerFirstName || prev.customerFirstName,
      customerLastName: scanResult.customerLastName || prev.customerLastName,
      customerPhone: scanResult.customerPhone || prev.customerPhone,
      customerEmail: scanResult.customerEmail || prev.customerEmail,
      customerAddress: scanResult.customerAddress || prev.customerAddress,
      storeName: scanResult.storeName || prev.storeName,
      storeOrderNumber: scanResult.storeOrderNumber || prev.storeOrderNumber,
      itemDescription: scanResult.items?.map((i) => i.name).join(', ') || prev.itemDescription,
    }));

    // Add extracted items
    if (scanResult.items && scanResult.items.length > 0) {
      const newItems = scanResult.items.map((item) => {
        const nameLower = item.name.toLowerCase();
        const matched = catalog.find((c) => {
          const catLower = c.name.toLowerCase();
          return (
            (nameLower.includes('sofa') && catLower.includes('sofa')) ||
            (nameLower.includes('bed') && catLower.includes('bed')) ||
            (nameLower.includes('mattress') && catLower.includes('mattress')) ||
            (nameLower.includes('dresser') && catLower.includes('dresser')) ||
            (nameLower.includes('table') && catLower.includes('table')) ||
            (nameLower.includes('chair') && catLower.includes('chair')) ||
            (nameLower.includes('recliner') && catLower.includes('recliner')) ||
            (nameLower.includes('entertainment') && catLower.includes('entertainment'))
          );
        });

        if (matched) {
          return {
            id: crypto.randomUUID(),
            catalogId: matched.id,
            category: matched.category,
            name: matched.name,
            quantity: item.quantity || 1,
            price: form.serviceType === 'removal' ? Math.round(matched.base_price * 0.85) : item.price || matched.base_price,
            image: matched.image,
            action: form.serviceType,
          };
        }

        return {
          id: crypto.randomUUID(),
          catalogId: null,
          category: 'other',
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price || 75,
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
          action: form.serviceType,
        };
      });

      setItems((prev) => [...prev, ...newItems]);
    }

    setScanResult(null);
    setPreviewUrl('');
    setScannedFile(null);
    toast.success('Form data applied!');
  };

  const dismissScan = () => {
    setScanResult(null);
    setPreviewUrl('');
    setScanError('');
    setScannedFile(null);
  };

  const addItem = (product: any) => {
    const existing = items.find((i) => i.catalogId === product.id);
    if (existing) {
      setItems(items.map((i) => i.catalogId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, {
        id: crypto.randomUUID(), catalogId: product.id, category: product.category,
        name: product.name, quantity: 1,
        price: form.serviceType === 'removal' ? Math.round(product.base_price * 0.85) : product.base_price,
        image: product.image, action: form.serviceType,
      }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setItems(items.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.085 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    if (!selectedDate || !selectedSlot) { toast.error('Select a delivery date and time'); return; }
    if (!form.customerFirstName || !form.customerPhone || !form.customerAddress) {
      toast.error('Fill in customer details'); return;
    }

    setSubmitting(true);
    try {
      const res = await ordersApi.create({
        serviceType: [form.serviceType],
        items: items.map((i) => ({ category: i.category, name: i.name, quantity: i.quantity, price: i.price, image: i.image, action: i.action })),
        pricing: { subtotal, discount: 0, tax, total },
        contactInfo: {
          firstName: form.customerFirstName, lastName: form.customerLastName,
          phone: form.customerPhone, email: form.customerEmail, address: form.customerAddress,
          communicationPrefs: ['text'],
        },
        orderDetails: form.storeName ? {
          storeName: form.storeName, orderNumber: form.storeOrderNumber, itemDescription: form.itemDescription,
        } : null,
        schedule: { date: selectedDate, timeSlot: selectedSlot },
        source: 'salesperson',
        salespersonId: user?.id,
      });
      // Save scanned form image with order if available
      if (formImageUrl) {
        try {
          await ordersApi.saveFormImage(res.orderId, formImageUrl);
        } catch (e) {
          console.log('Failed to save form image');
        }
      }

      setReference(res.reference);
      setDone(true);
      setFormImageUrl('');
      toast.success(`Order created: ${res.reference}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'salesperson') return null;

  if (done) {
    return (
      <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-heading-s text-white">ORDER PLACED!</h2>
          <p className="text-[#64748B] mt-2">Reference: <span className="text-white font-mono">{reference}</span></p>
          <button onClick={() => { setDone(false); setItems([]); setSelectedDate(''); setSelectedSlot(''); setForm({ customerFirstName: '', customerLastName: '', customerPhone: '', customerEmail: '', customerAddress: '', storeName: '', storeOrderNumber: '', itemDescription: '', serviceType: 'delivery' }); }}
            className="btn-primary mt-6">Book Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate('/salesperson')} className="text-sm text-[#64748B] hover:text-white flex items-center gap-1 mb-4">
          <ArrowLeft size={14} /> Back to Portal
        </button>
        <h1 className="font-display text-heading-m text-white">BOOK FOR CUSTOMER</h1>
        <p className="text-body-m text-[#64748B] mt-1">Quick order entry at the store</p>

        {/* AI Scan Section */}
        <div className="mt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!previewUrl && !scanResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#0F1D32] border-2 border-dashed border-[#E63946]/40 rounded-2xl p-6 text-center hover:border-[#E63946] hover:bg-[#E63946]/5 transition-colors group"
            >
              <div className="w-14 h-14 bg-[#E63946]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#E63946]/20 transition-colors">
                <ScanLine size={28} className="text-[#E63946]" />
              </div>
              <h3 className="font-display text-label text-white">SCAN PAPER FORM</h3>
              <p className="text-xs text-[#64748B] mt-1">Take a photo of the Ashley/Furniture Mart sales order</p>
              <p className="text-[10px] text-[#64748B]/60 mt-2">AI will auto-fill everything in seconds</p>
            </motion.button>
          )}

          {/* Preview + Loading */}
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0F1D32] border border-white/10 rounded-2xl overflow-hidden"
              >
                <img src={previewUrl} alt="Form preview" className="w-full h-64 object-contain bg-black/20" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                    <Loader2 size={40} className="text-[#E63946] animate-spin mb-3" />
                    <p className="text-white font-display text-sm">READING FORM WITH AI...</p>
                    <p className="text-[#64748B] text-xs mt-1">Extracting customer, items, and totals</p>
                  </div>
                )}
                {!scanning && !scanResult && !scanError && (
                  <button onClick={dismissScan} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
                    <X size={16} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan Error */}
          <AnimatePresence>
            {scanError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl flex items-center gap-3"
              >
                <AlertCircle size={20} className="text-[#E63946] shrink-0" />
                <div className="flex-1">
                  <p className="text-[#E63946] text-sm font-medium">Could not read the form</p>
                  <p className="text-[#E63946]/70 text-xs">{scanError}</p>
                </div>
                <button onClick={dismissScan} className="text-[#E63946] text-xs underline">Try Again</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan Results */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 bg-[#0F1D32] border border-green-500/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-green-400" />
                  <h3 className="font-display text-label text-white">AI EXTRACTION RESULT</h3>
                </div>

                <div className="space-y-2 text-sm">
                  {scanResult.customerFirstName && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Customer</span>
                      <span className="text-white">{scanResult.customerFirstName} {scanResult.customerLastName}</span>
                    </div>
                  )}
                  {scanResult.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Phone</span>
                      <span className="text-white">{scanResult.customerPhone}</span>
                    </div>
                  )}
                  {scanResult.customerAddress && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Address</span>
                      <span className="text-white text-right max-w-[60%]">{scanResult.customerAddress}</span>
                    </div>
                  )}
                  {scanResult.storeName && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Store</span>
                      <span className="text-white">{scanResult.storeName}</span>
                    </div>
                  )}
                  {scanResult.storeOrderNumber && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Order #</span>
                      <span className="text-white font-mono">{scanResult.storeOrderNumber}</span>
                    </div>
                  )}
                  {scanResult.items && scanResult.items.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[#64748B] text-xs uppercase tracking-wider">Items Found</span>
                      <div className="mt-1 space-y-1">
                        {scanResult.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-white">
                            <span className="truncate max-w-[70%]">{item.quantity}x {item.name}</span>
                            <span className="text-[#64748B]">${item.price?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {scanResult.total && (
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-[#64748B]">Total</span>
                      <span className="text-green-400 font-medium">${scanResult.total.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={applyScan} className="flex-1 btn-primary justify-center text-sm py-2.5">
                    <CheckCircle size={16} /> Apply to Form
                  </button>
                  <button onClick={dismissScan} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Service Type */}
        <div className="flex gap-3 mt-6">
          {(['delivery', 'removal'] as const).map((t) => (
            <button key={t} onClick={() => { setForm({ ...form, serviceType: t }); setItems([]); }}
              className={`flex-1 py-3 rounded-xl font-display text-label transition-colors ${
                form.serviceType === t ? 'bg-[#E63946] text-white' : 'bg-white/10 text-[#64748B] hover:bg-white/20'
              }`}>
              {t === 'delivery' ? 'Delivery' : 'Removal'}
            </button>
          ))}
        </div>

        {/* Customer Info */}
        <div className="mt-6 bg-[#0F1D32] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="font-display text-label text-white">CUSTOMER INFO</h3>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="First Name" value={form.customerFirstName} onChange={(e) => setForm({ ...form, customerFirstName: e.target.value })} />
            <input className="input-field" placeholder="Last Name" value={form.customerLastName} onChange={(e) => setForm({ ...form, customerLastName: e.target.value })} />
          </div>
          <input className="input-field" placeholder="Phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
          <input className="input-field" placeholder="Email (optional)" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
          <input className="input-field" placeholder="Delivery Address" value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} />
        </div>

        {/* Store Info */}
        <div className="mt-4 bg-[#0F1D32] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="font-display text-label text-white">STORE ORDER INFO</h3>
          <select className="input-field" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })}>
            <option value="">Select Store</option>
            {stores.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <input className="input-field" placeholder="Store Order #" value={form.storeOrderNumber} onChange={(e) => setForm({ ...form, storeOrderNumber: e.target.value })} />
          <input className="input-field" placeholder="Item Description" value={form.itemDescription} onChange={(e) => setForm({ ...form, itemDescription: e.target.value })} />
        </div>

        {/* Items */}
        <div className="mt-4 bg-[#0F1D32] border border-white/10 rounded-2xl p-5">
          <h3 className="font-display text-label text-white mb-3">ITEMS</h3>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {catalog.map((product) => (
              <button key={product.id} onClick={() => addItem(product)}
                className="bg-white/5 rounded-lg p-2 text-left hover:bg-white/10 transition-colors">
                <img src={product.image} alt="" className="w-full h-16 object-cover rounded mb-1" />
                <p className="text-[10px] text-white truncate">{product.name}</p>
                <p className="text-[10px] text-[#64748B]">${form.serviceType === 'removal' ? Math.round(product.base_price * 0.85) : product.base_price}</p>
              </button>
            ))}
          </div>

          {items.length > 0 && (
            <div className="mt-3 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                  <span className="text-white text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white/10 rounded text-white">-</button>
                    <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white/10 rounded text-white">+</button>
                    <button onClick={() => removeItem(item.id)} className="text-[#E63946] ml-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-white text-sm pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="mt-4 bg-[#0F1D32] border border-white/10 rounded-2xl p-5">
          <h3 className="font-display text-label text-white mb-3">SCHEDULE</h3>
          <input type="date" className="input-field" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }} min={new Date().toISOString().split('T')[0]} />
          {selectedDate && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {availableSlots.map((slot) => (
                <button key={slot.id} onClick={() => setSelectedSlot(slot.time_slot)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedSlot === slot.time_slot ? 'bg-[#E63946] text-white' : 'bg-white/10 text-[#64748B] hover:bg-white/20'
                  }`}>
                  {slot.time_slot}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full btn-primary justify-center mt-6 mb-10">
          <Package size={18} />
          {submitting ? 'Creating Order...' : 'Create Order Ticket'}
        </button>
      </div>
    </div>
  );
}
