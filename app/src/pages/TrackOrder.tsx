import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { ordersApi } from '@/services/api';

const statusSteps = [
  { status: 'pending', label: 'Booked', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'scheduled', label: 'Scheduled', icon: Clock },
  { status: 'dispatched', label: 'Dispatched', icon: Truck },
  { status: 'in_transit', label: 'In Transit', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  { status: 'completed', label: 'Completed', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  scheduled: 'bg-purple-500',
  dispatched: 'bg-orange-500',
  in_transit: 'bg-[#E63946]',
  delivered: 'bg-green-500',
  completed: 'bg-green-600',
  cancelled: 'bg-gray-500',
};

export default function TrackOrder() {
  const { reference: urlRef } = useParams();
  const [reference, setReference] = useState(urlRef || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.track(reference.trim().toUpperCase());
      setOrder(data);
    } catch {
      setError('Order not found. Please check your reference number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (urlRef && !order && !loading && !error) {
    // Auto-track if reference in URL
    setLoading(true);
    ordersApi.track(urlRef.toUpperCase())
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }

  const currentStepIndex = order ? statusSteps.findIndex(s => s.status === order.status) : -1;

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-heading-m text-white">TRACK YOUR ORDER</h1>
          <p className="text-body-m text-[#64748B] mt-2">Enter your order reference to see live status</p>
        </motion.div>

        <form onSubmit={handleTrack} className="flex gap-3 max-w-lg mx-auto mb-12">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. XM-482931"
            className="input-field flex-1 uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6"
          >
            <Search size={18} />
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[#E63946] mb-8">
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-label text-[#64748B] text-xs">ORDER REFERENCE</p>
                    <p className="font-display text-2xl text-white">{order.reference}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${statusColors[order.status] || 'bg-gray-500'}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-label text-[#64748B] text-xs">CUSTOMER</p>
                    <p className="text-white text-sm mt-1">{order.contactInfo?.firstName} {order.contactInfo?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-label text-[#64748B] text-xs">SERVICE</p>
                    <p className="text-white text-sm mt-1">{order.serviceType?.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' & ')}</p>
                  </div>
                  <div>
                    <p className="text-label text-[#64748B] text-xs">SCHEDULED</p>
                    <p className="text-white text-sm mt-1">{order.schedule?.date || 'Not scheduled'}</p>
                  </div>
                  <div>
                    <p className="text-label text-[#64748B] text-xs">CREW</p>
                    <p className="text-white text-sm mt-1">{order.assignedCrew || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6">
                <h3 className="font-display text-label text-white mb-6">DELIVERY TIMELINE</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
                  <div className="space-y-6">
                    {order.statusTimeline?.map((event: any, i: number) => {
                      const isActive = i <= currentStepIndex;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="relative flex items-start gap-4 pl-2"
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10 mt-0.5 ${isActive ? 'bg-[#E63946]' : 'bg-[#1A2E4A] border border-white/20'}`}>
                            {isActive && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{event.label}</p>
                            <p className="text-[#64748B] text-xs mt-0.5">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.note && (
                              <p className="text-[#64748B] text-xs mt-1">{event.note}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6">
                <h3 className="font-display text-label text-white mb-4">ITEMS</h3>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-[#64748B] text-xs">{item.action === 'deliver' ? 'Delivery' : 'Removal'} × {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">${item.price}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-[#64748B]">Total</span>
                  <span className="text-white font-display text-label">${order.pricing?.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Photos */}
              {order.deliveryPhotos && order.deliveryPhotos.length > 0 && (
                <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6">
                  <h3 className="font-display text-label text-white mb-4">DELIVERY PHOTOS</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {order.deliveryPhotos.map((photo: any) => (
                      <div key={photo.id} className="relative group">
                        <img src={photo.url} alt="Delivery" className="w-full h-32 object-cover rounded-xl" />
                        {photo.note && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            {photo.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6 flex items-start gap-3">
                <MapPin size={20} className="text-[#E63946] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-label text-[#64748B] text-xs">DELIVERY ADDRESS</p>
                  <p className="text-white text-sm mt-1">{order.contactInfo?.address}</p>
                </div>
              </div>

              <div className="text-center">
                <Link to="/booking" className="btn-primary inline-flex">
                  Book Another Delivery <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
