import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, DollarSign, Users, Camera, TrendingUp, PlusCircle, FileText, CheckCircle, MessageSquare, Image, Send, X, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, salespeopleApi, messagesApi } from '@/services/api';
import { toast } from 'sonner';

export default function SalespersonPortal() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [stats, setStats] = useState({ totalReferrals: 0, totalRevenue: 0, code: '', discountPercent: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'salesperson') { navigate('/'); return; }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    try {
      const statsData = await salespeopleApi.myStats();
      setStats(statsData);
      const ordersData = await ordersApi.list({ affiliateCode: user?.code || '' });
      setOrders(ordersData);
    } catch {
      // ignore
    }
  };

  const openOrderDetail = async (order: any) => {
    setSelectedOrder(order);
    try {
      const msgs = await messagesApi.list(order.id);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
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
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Invoice failed');
    }
  };

  const sendProof = async (orderId: string) => {
    try {
      const res = await ordersApi.sendProofPacket(orderId);
      if (res.sent) toast.success('Proof packet sent to your email!');
      else toast.info(res.reason || 'Could not send');
    } catch (err: any) {
      toast.error(err.message || 'Proof packet failed');
    }
  };

  if (!isAuthenticated || user?.role !== 'salesperson') return null;

  const referralUrl = `${window.location.origin}/booking?ref=${stats.code}`;

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400',
    confirmed: 'text-blue-400',
    scheduled: 'text-purple-400',
    dispatched: 'text-orange-400',
    in_transit: 'text-[#E63946]',
    delivered: 'text-green-400',
    completed: 'text-green-500',
    cancelled: 'text-gray-400',
  };

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-heading-m text-white">SALESPERSON PORTAL</h1>
          <p className="text-body-m text-[#64748B] mt-1">Welcome back, {user?.name}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0F1D32] border border-white/10 rounded-2xl p-5">
            <Users size={20} className="text-[#E63946] mb-3" />
            <p className="font-display text-2xl text-white">{stats.totalReferrals}</p>
            <p className="text-label text-[#64748B] text-xs mt-1">Referrals</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#0F1D32] border border-white/10 rounded-2xl p-5">
            <DollarSign size={20} className="text-green-500 mb-3" />
            <p className="font-display text-2xl text-white">${stats.totalRevenue?.toFixed(0)}</p>
            <p className="text-label text-[#64748B] text-xs mt-1">Revenue</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0F1D32] border border-white/10 rounded-2xl p-5">
            <TrendingUp size={20} className="text-blue-500 mb-3" />
            <p className="font-display text-2xl text-white">{stats.discountPercent}%</p>
            <p className="text-label text-[#64748B] text-xs mt-1">Your Discount</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#0F1D32] border border-white/10 rounded-2xl p-5">
            <Package size={20} className="text-purple-500 mb-3" />
            <p className="font-display text-2xl text-white">{orders.length}</p>
            <p className="text-label text-[#64748B] text-xs mt-1">Total Orders</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-8">
          <Link to="/salesperson/book" className="btn-primary w-full justify-center text-center py-4 text-lg">
            <PlusCircle size={20} /> Book for Customer
          </Link>
        </motion.div>

        {/* Referral Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 bg-[#0F1D32] border border-[#E63946]/30 rounded-2xl p-6">
          <h3 className="font-display text-label text-white mb-2">YOUR REFERRAL LINK</h3>
          <p className="text-[#64748B] text-sm mb-3">Share this with customers at closing. They'll get {stats.discountPercent}% off automatically.</p>
          <div className="flex gap-2">
            <input readOnly value={referralUrl} className="input-field flex-1 text-sm bg-[#0A1628]" />
            <button onClick={() => navigator.clipboard.writeText(referralUrl)} className="btn-primary px-4">Copy</button>
          </div>
        </motion.div>

        {/* Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <h3 className="font-display text-label text-white mb-4">YOUR REFERRAL ORDERS</h3>
          <div className="bg-[#0F1D32] border border-white/10 rounded-2xl overflow-hidden">
            {orders.length === 0 && (
              <div className="p-8 text-center text-[#64748B]">No orders yet. Share your referral link!</div>
            )}
            {orders.map((order) => (
              <div key={order.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => openOrderDetail(order)}>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono text-sm">{order.reference}</p>
                      <span className={`text-[10px] uppercase tracking-wider ${statusColors[order.status] || 'text-[#64748B]'}`}>{order.status}</span>
                    </div>
                    <p className="text-[#64748B] text-xs">{order.contactInfo?.firstName} {order.contactInfo?.lastName} · ${order.pricing?.total?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.invoice_url && (
                      <a href={order.invoice_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500/10 rounded-lg text-green-400 hover:bg-green-500/20" title="Download Invoice">
                        <Download size={14} />
                      </a>
                    )}
                    <Link to={`/salesperson/upload/${order.id}`} className="text-xs bg-[#E63946]/20 text-[#E63946] px-3 py-1.5 rounded-lg hover:bg-[#E63946]/30 transition-colors flex items-center gap-1">
                      <Camera size={12} /> Upload
                    </Link>
                  </div>
                </div>

                {/* Order meta badges */}
                <div className="flex items-center gap-3 mt-2">
                  {order.formImages?.length > 0 && (
                    <span className="text-[10px] flex items-center gap-1 text-blue-400">
                      <Image size={10} /> Form saved
                    </span>
                  )}
                  {order.deliveryPhotos?.length > 0 && (
                    <span className="text-[10px] flex items-center gap-1 text-green-400">
                      <CheckCircle size={10} /> {order.deliveryPhotos.length} delivery photo{order.deliveryPhotos.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {order.messages?.length > 0 && (
                    <span className="text-[10px] flex items-center gap-1 text-[#64748B]">
                      <MessageSquare size={10} /> {order.messages.length}
                    </span>
                  )}
                </div>

                {/* Actions for delivered orders */}
                {(order.status === 'delivered' || order.status === 'completed') && (
                  <div className="flex gap-2 mt-2">
                    {!order.invoice_url && (
                      <button onClick={() => generateInvoice(order.id)} className="text-[10px] bg-white/5 text-white px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1">
                        <FileText size={10} /> Generate Invoice
                      </button>
                    )}
                    <button onClick={() => sendProof(order.id)} className="text-[10px] bg-[#E63946]/10 text-[#E63946] px-2 py-1 rounded hover:bg-[#E63946]/20 flex items-center gap-1">
                      <Send size={10} /> Send Proof Packet
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-[#0F1D32] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-label text-white">{selectedOrder.reference}</h3>
                  <p className="text-xs text-[#64748B]">{selectedOrder.contactInfo?.firstName} {selectedOrder.contactInfo?.lastName}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-lg"><X size={18} className="text-[#64748B]" /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Form Images */}
                {selectedOrder.formImages?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-[#64748B] uppercase tracking-wider mb-2">Store Order Form</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.formImages.map((img: any) => (
                        <img key={img.id} src={img.url} alt="Form" className="rounded-lg border border-white/10" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Photos */}
                {selectedOrder.deliveryPhotos?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-[#64748B] uppercase tracking-wider mb-2">Delivery Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.deliveryPhotos.map((photo: any) => (
                        <img key={photo.id} src={photo.url} alt="Delivery" className="rounded-lg border border-white/10" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div>
                  <h4 className="text-xs text-[#64748B] uppercase tracking-wider mb-2">Messages</h4>
                  <div className="bg-[#0A1628] rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                    {messages.length === 0 && <p className="text-xs text-[#64748B]">No messages yet</p>}
                    {messages.map((msg: any) => (
                      <div key={msg.id} className={`text-xs p-2 rounded-lg ${msg.sender_role === 'system' ? 'bg-blue-500/10 text-blue-300' : msg.sender_role === 'salesperson' ? 'bg-[#E63946]/10 text-white' : 'bg-white/5 text-[#64748B]'}`}>
                        <span className="font-medium">{msg.sender_name}</span>
                        <span className="text-[10px] text-[#64748B] ml-2">{new Date(msg.created_at).toLocaleString()}</span>
                        <p className="mt-0.5">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      className="input-field text-xs flex-1"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} disabled={sendingMsg} className="btn-primary px-3 py-2">
                      <Send size={14} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {selectedOrder.invoice_url ? (
                    <a href={selectedOrder.invoice_url} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary justify-center text-sm py-2.5">
                      <Download size={14} /> Download Invoice
                    </a>
                  ) : (
                    <button onClick={() => generateInvoice(selectedOrder.id)} className="flex-1 btn-primary justify-center text-sm py-2.5">
                      <FileText size={14} /> Generate Invoice
                    </button>
                  )}
                  <button onClick={() => sendProof(selectedOrder.id)} className="flex-1 btn-secondary justify-center text-sm py-2.5">
                    <Send size={14} /> Proof Packet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
