import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Send, MessageSquare, Image, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, messagesApi } from '@/services/api';

const statusOptions = ['all', 'pending', 'confirmed', 'scheduled', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  scheduled: 'bg-purple-500/20 text-purple-400',
  dispatched: 'bg-orange-500/20 text-orange-400',
  in_transit: 'bg-[#E63946]/20 text-[#E63946]',
  delivered: 'bg-green-500/20 text-green-400',
  completed: 'bg-green-600/20 text-green-500',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadOrders();
  }, [isAuthenticated, user, navigate]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.list();
      setOrders(data);
      setFiltered(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.reference?.toLowerCase().includes(term) ||
          o.contactInfo?.firstName?.toLowerCase().includes(term) ||
          o.contactInfo?.lastName?.toLowerCase().includes(term) ||
          o.contactInfo?.phone?.includes(term) ||
          o.orderDetails?.storeName?.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
  }, [statusFilter, searchTerm, orders]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      toast.success(`Status updated to ${status}`);
      const updated = await ordersApi.list();
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        const refreshed = await ordersApi.get(orderId);
        setSelectedOrder(refreshed);
        loadMessages(refreshed.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const loadMessages = async (orderId: string) => {
    try {
      const msgs = await messagesApi.list(orderId);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  const openOrderDetail = async (order: any) => {
    setSelectedOrder(order);
    loadMessages(order.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    setSendingMsg(true);
    try {
      const msg = await messagesApi.send(selectedOrder.id, newMessage);
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSendingMsg(false);
    }
  };

  const generateInvoice = async (orderId: string) => {
    try {
      const res = await ordersApi.generateInvoice(orderId);
      toast.success('Invoice generated!');
      window.open(res.invoiceUrl, '_blank');
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const refreshed = await ordersApi.get(orderId);
        setSelectedOrder(refreshed);
      }
    } catch (err: any) {
      toast.error(err.message || 'Invoice failed');
    }
  };

  const sendProof = async (orderId: string) => {
    try {
      const res = await ordersApi.sendProofPacket(orderId);
      if (res.sent) toast.success('Proof packet sent!');
      else toast.info(res.reason || 'Could not send');
    } catch (err: any) {
      toast.error(err.message || 'Proof packet failed');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-heading-m text-white">ORDERS</h1>
            <Link to="/admin" className="text-sm text-[#64748B] hover:text-white">← Back to Dashboard</Link>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3 mt-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search orders..." className="input-field pl-9 w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 bg-[#0F1D32] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-label text-[#64748B] text-xs">
                  <th className="p-4">REF</th>
                  <th className="p-4">CUSTOMER</th>
                  <th className="p-4">STORE</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">TOTAL</th>
                  <th className="p-4">PROOF</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={8} className="p-8 text-center text-[#64748B]">Loading...</td></tr>}
                {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-[#64748B]">No orders found</td></tr>}
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openOrderDetail(order)}>
                    <td className="p-4 text-white font-mono text-sm">{order.reference}</td>
                    <td className="p-4">
                      <p className="text-white text-sm">{order.contactInfo?.firstName} {order.contactInfo?.lastName}</p>
                      <p className="text-[#64748B] text-xs">{order.contactInfo?.phone}</p>
                    </td>
                    <td className="p-4 text-[#64748B] text-xs">{order.orderDetails?.storeName || '—'}</td>
                    <td className="p-4 text-[#64748B] text-sm">{order.schedule?.date || '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-white text-sm">${order.pricing?.total?.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {order.formImages?.length > 0 && <span title="Form saved"><Image size={14} className="text-blue-400" /></span>}
                        {order.deliveryPhotos?.length > 0 && <span title={`${order.deliveryPhotos.length} delivery photos`}><CheckCircle size={14} className="text-green-400" /></span>}
                        {order.invoice_url && <span title="Invoice ready"><FileText size={14} className="text-purple-400" /></span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-[#E63946] text-xs hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0F1D32] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-heading-s text-white">{selectedOrder.reference}</h2>
                  <p className="text-xs text-[#64748B]">{selectedOrder.orderDetails?.storeName} · {selectedOrder.orderDetails?.orderNumber}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-[#64748B] hover:text-white"><X size={24} /></button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-label text-[#64748B] text-xs">CUSTOMER</p>
                  <p className="text-white text-sm mt-1">{selectedOrder.contactInfo?.firstName} {selectedOrder.contactInfo?.lastName}</p>
                  <p className="text-[#64748B] text-xs">{selectedOrder.contactInfo?.phone}</p>
                  <p className="text-[#64748B] text-xs">{selectedOrder.contactInfo?.email}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-label text-[#64748B] text-xs">ADDRESS</p>
                  <p className="text-white text-sm mt-1">{selectedOrder.contactInfo?.address}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-label text-[#64748B] text-xs">SCHEDULE</p>
                  <p className="text-white text-sm mt-1">{selectedOrder.schedule?.date || 'Not scheduled'}</p>
                  <p className="text-[#64748B] text-xs">{selectedOrder.schedule?.timeSlot || ''}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-label text-[#64748B] text-xs">SALESPERSON</p>
                  <p className="text-white text-sm mt-1">{selectedOrder.salesperson?.name || '—'}</p>
                  <p className="text-[#64748B] text-xs">{selectedOrder.salesperson?.code || ''}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <p className="text-label text-[#64748B] text-xs mb-2">ITEMS</p>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2 mb-1">
                    <span className="text-white text-sm">{item.name} × {item.quantity}</span>
                    <span className="text-white text-sm">${item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                  <span className="text-[#64748B] text-sm">Total</span>
                  <span className="text-white font-medium">${selectedOrder.pricing?.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Form Images */}
              {selectedOrder.formImages?.length > 0 && (
                <div className="mb-6">
                  <p className="text-label text-[#64748B] text-xs mb-2">STORE ORDER FORM</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedOrder.formImages.map((img: any) => (
                      <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                        <img src={img.url} alt="Form" className="rounded-lg border border-white/10 hover:border-[#E63946] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Photos */}
              {selectedOrder.deliveryPhotos?.length > 0 && (
                <div className="mb-6">
                  <p className="text-label text-[#64748B] text-xs mb-2">DELIVERY PHOTOS</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedOrder.deliveryPhotos.map((photo: any) => (
                      <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                        <img src={photo.url} alt="Delivery" className="rounded-lg border border-white/10 hover:border-[#E63946] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="mb-6">
                <p className="text-label text-[#64748B] text-xs mb-2 flex items-center gap-1"><MessageSquare size={12} /> MESSAGES</p>
                <div className="bg-[#0A1628] rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {messages.length === 0 && <p className="text-xs text-[#64748B]">No messages yet</p>}
                  {messages.map((msg: any) => (
                    <div key={msg.id} className={`text-xs p-2 rounded-lg ${msg.sender_role === 'system' ? 'bg-blue-500/10 text-blue-300' : msg.sender_role === 'admin' ? 'bg-[#E63946]/10 text-white' : 'bg-white/5 text-[#64748B]'}`}>
                      <span className="font-medium">{msg.sender_name}</span>
                      <span className="text-[10px] text-[#64748B] ml-2">{new Date(msg.created_at).toLocaleString()}</span>
                      <p className="mt-0.5">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input className="input-field text-xs flex-1" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                  <button onClick={sendMessage} disabled={sendingMsg} className="btn-primary px-3 py-2"><Send size={14} /></button>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <p className="text-label text-[#64748B] text-xs mb-2">UPDATE STATUS</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.filter((s) => s !== 'all').map((status) => (
                    <button key={status} onClick={() => handleStatusUpdate(selectedOrder.id, status)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedOrder.status === status ? 'bg-[#E63946] text-white' : 'bg-white/10 text-[#64748B] hover:bg-white/20'}`}>
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedOrder.invoice_url ? (
                  <a href={selectedOrder.invoice_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2.5 flex items-center gap-2">
                    <Download size={14} /> Download Invoice
                  </a>
                ) : (
                  <button onClick={() => generateInvoice(selectedOrder.id)} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                    <FileText size={14} /> Generate Invoice
                  </button>
                )}
                <button onClick={() => sendProof(selectedOrder.id)} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
                  <Send size={14} /> Send Proof Packet
                </button>
              </div>

              {/* Timeline */}
              <div className="mt-6">
                <p className="text-label text-[#64748B] text-xs mb-2">TIMELINE</p>
                <div className="space-y-2">
                  {selectedOrder.statusTimeline?.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#E63946]" />
                      <span className="text-white">{t.label}</span>
                      <span className="text-[#64748B] text-xs">{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
