import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users, DollarSign, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { salespeopleApi } from '@/services/api';

export default function AdminSalespeople() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', code: '', discountPercent: 10, password: '' });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadSalespeople();
  }, [isAuthenticated, user, navigate]);

  const loadSalespeople = async () => {
    try {
      const data = await salespeopleApi.list();
      setSalespeople(data);
    } catch {
      // ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salespeopleApi.create(formData);
      toast.success('Salesperson created');
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', code: '', discountPercent: 10, password: '' });
      loadSalespeople();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create');
    }
  };

  const toggleActive = async (id: string, current: number) => {
    try {
      await salespeopleApi.update(id, { active: !current });
      toast.success(`Salesperson ${current ? 'deactivated' : 'activated'}`);
      loadSalespeople();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-heading-m text-white">SALESPEOPLE</h1>
            <Link to="/admin" className="text-sm text-[#64748B] hover:text-white">← Back to Dashboard</Link>
          </div>
        </motion.div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-6 btn-primary inline-flex"
        >
          <Plus size={18} />
          Add Salesperson
        </button>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-[#0F1D32] border border-white/10 rounded-2xl p-6 grid sm:grid-cols-2 gap-4"
            onSubmit={handleCreate}
          >
            <input className="input-field" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input className="input-field" placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <input className="input-field" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <input className="input-field" placeholder="Referral Code (e.g. MIKE10)" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
            <input className="input-field" placeholder="Discount %" type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })} required />
            <input className="input-field" placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Create Salesperson</button>
            </div>
          </motion.form>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {salespeople.map((sp, i) => (
            <motion.div
              key={sp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">{sp.name}</h3>
                  <p className="text-[#64748B] text-sm">{sp.email}</p>
                </div>
                <button onClick={() => toggleActive(sp.id, sp.active)}>
                  {sp.active ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-500" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <Users size={16} className="text-[#E63946] mx-auto mb-1" />
                  <p className="text-white font-display text-label">{sp.total_referrals}</p>
                  <p className="text-[#64748B] text-[10px]">Referrals</p>
                </div>
                <div className="text-center">
                  <DollarSign size={16} className="text-green-500 mx-auto mb-1" />
                  <p className="text-white font-display text-label">${sp.total_revenue?.toFixed(0)}</p>
                  <p className="text-[#64748B] text-[10px]">Revenue</p>
                </div>
                <div className="text-center">
                  <TrendingUp size={16} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-white font-display text-label">{sp.discount_percent}%</p>
                  <p className="text-[#64748B] text-[10px]">Discount</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs bg-[#E63946]/20 text-[#E63946] px-2 py-1 rounded font-mono">{sp.code}</span>
                <span className={`text-xs ${sp.active ? 'text-green-400' : 'text-gray-400'}`}>
                  {sp.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
