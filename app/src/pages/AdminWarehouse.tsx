import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck, Clock, AlertCircle, Search } from 'lucide-react';
import { ordersApi } from '@/services/api';
import { toast } from 'sonner';

export default function AdminWarehouse() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'warehouse_new' | 'warehouse_picking' | 'warehouse_ready' | 'in_transit'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    const data = await ordersApi.list();
    setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateWarehouseStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      await ordersApi.updateStatus(id, { status, warehouse_status: status });
      toast.success(`Status updated to ${status}`);
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.warehouse_status !== filter) return false;
    if (search && !o.reference?.toLowerCase().includes(search.toLowerCase()) && !o.customer_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    warehouse_new: { label: 'New', color: 'text-blue-400', icon: Package },
    warehouse_picking: { label: 'Picking', color: 'text-yellow-400', icon: Clock },
    warehouse_ready: { label: 'Ready', color: 'text-green-400', icon: CheckCircle },
    in_transit: { label: 'In Transit', color: 'text-[#E63946]', icon: Truck },
  };

  return (
    <div className="min-h-screen bg-[#0A1628] pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-heading-m text-white">WAREHOUSE</h1>
            <p className="text-body-m text-[#64748B] mt-1">Order fulfillment workflow</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input className="input-field pl-9" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {(['all', 'warehouse_new', 'warehouse_picking', 'warehouse_ready', 'in_transit'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-[#E63946] text-white' : 'bg-white/10 text-[#64748B] hover:bg-white/20'
              }`}>
              {f === 'all' ? 'All Orders' : statusConfig[f]?.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="mt-6 space-y-3">
          {filtered.length === 0 && <p className="text-[#64748B] text-center py-10">No orders found</p>}
          {filtered.map((order) => {
            const cfg = statusConfig[order.warehouse_status || 'warehouse_new'] || statusConfig.warehouse_new;
            const Icon = cfg.icon;
            return (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0F1D32] border border-white/10 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-label text-white">{order.reference}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/10 ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">{order.customer_name} — {order.delivery_address}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{order.items?.length || 0} items — ${order.total_amount?.toFixed(2)}</p>
                    {order.salesperson_name && (
                      <p className="text-xs text-[#64748B] mt-0.5">Salesperson: <span className="text-white">{order.salesperson_name}</span></p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {order.warehouse_status === 'warehouse_new' && (
                      <button onClick={() => updateWarehouseStatus(order.id, 'warehouse_picking')} className="btn-primary text-xs">
                        <Clock size={14} /> Start Picking
                      </button>
                    )}
                    {order.warehouse_status === 'warehouse_picking' && (
                      <button onClick={() => updateWarehouseStatus(order.id, 'warehouse_ready')} className="btn-primary text-xs">
                        <CheckCircle size={14} /> Mark Ready
                      </button>
                    )}
                    {order.warehouse_status === 'warehouse_ready' && (
                      <button onClick={() => updateWarehouseStatus(order.id, 'in_transit')} className="btn-primary text-xs">
                        <Truck size={14} /> Dispatch
                      </button>
                    )}
                    {order.warehouse_status === 'in_transit' && (
                      <span className="text-xs text-[#64748B] flex items-center gap-1">
                        <Truck size={14} /> Out for delivery
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
