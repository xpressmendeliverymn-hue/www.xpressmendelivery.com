import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, DollarSign, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
// import { useOrderStore } from '@/store/orderStore';
import { ordersApi, scheduleApi } from '@/services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [stats, setStats] = useState({ totalOrders: 0, todayOrders: 0, revenue: 0, pendingOrders: 0 });
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }

    const today = new Date().toISOString().split('T')[0];

    ordersApi.list().then((orders: any[]) => {
      setRecentOrders(orders.slice(0, 5));
      const todayOrders = orders.filter((o) => o.schedule?.date === today);
      const pending = orders.filter((o) => o.status === 'pending');
      const revenue = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
      setStats({
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        revenue,
        pendingOrders: pending.length,
      });
    });

    scheduleApi.list({ dateFrom: today, dateTo: today }).then(setTodaySlots);
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, href: '/admin/orders' },
    { label: "Today's Jobs", value: stats.todayOrders, icon: Calendar, href: '/admin/schedule' },
    { label: 'Pending', value: stats.pendingOrders, icon: TrendingUp, href: '/admin/orders?status=pending' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, href: '/admin/orders' },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-heading-m text-white">ADMIN DASHBOARD</h1>
          <p className="text-body-m text-[#64748B] mt-1">Overview of operations</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={card.href}
                className="block bg-[#0F1D32] border border-white/10 rounded-2xl p-5 hover:border-[#E63946]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <card.icon size={20} className="text-[#E63946]" />
                  <ArrowRight size={14} className="text-[#64748B]" />
                </div>
                <p className="font-display text-2xl text-white">{card.value}</p>
                <p className="text-label text-[#64748B] text-xs mt-1">{card.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-label text-white">TODAY'S SCHEDULE</h3>
              <Link to="/admin/schedule" className="text-xs text-[#E63946] hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {todaySlots.length === 0 && (
                <p className="text-[#64748B] text-sm">No scheduled jobs today</p>
              )}
              {todaySlots.filter((s) => s.status === 'booked').map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{slot.crew_name}</p>
                    <p className="text-[#64748B] text-xs">{slot.time_slot}</p>
                  </div>
                  <span className="text-xs bg-[#E63946]/20 text-[#E63946] px-2 py-1 rounded">Booked</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-label text-white">RECENT ORDERS</h3>
              <Link to="/admin/orders" className="text-xs text-[#E63946] hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{order.reference}</p>
                    <p className="text-[#64748B] text-xs">
                      {order.contactInfo?.firstName} {order.contactInfo?.lastName} · {order.status}
                    </p>
                  </div>
                  <span className="text-white text-sm">${order.pricing?.total?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
          <Link to="/admin/orders" className="btn-primary justify-center text-center text-sm">Orders</Link>
          <Link to="/admin/schedule" className="btn-primary justify-center text-center text-sm">Schedule</Link>
          <Link to="/admin/salespeople" className="btn-primary justify-center text-center text-sm">Salespeople</Link>
          <Link to="/admin/invites" className="btn-primary justify-center text-center text-sm">Invites</Link>
          <Link to="/admin/warehouse" className="btn-primary justify-center text-center text-sm">Warehouse</Link>
          <Link to="/booking" className="btn-secondary justify-center text-center text-sm">New Booking</Link>
        </div>
      </div>
    </div>
  );
}
