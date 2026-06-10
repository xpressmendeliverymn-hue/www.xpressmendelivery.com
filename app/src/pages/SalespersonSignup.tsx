import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { salespeopleApi } from '@/services/api';
export default function SalespersonSignup() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [validating, setValidating] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { setError('Invalid invite link'); setValidating(false); return; }
    salespeopleApi.validateInvite(token)
      .then(setInvite)
      .catch(() => setError('This invite link is invalid or has expired'))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/salespeople/signup/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('xpress_token', data.token);
      setSuccess(true);
      setTimeout(() => navigate('/salesperson'), 1500);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 size={32} className="text-[#E63946] animate-spin" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <div className="bg-[#0F1D32] border border-[#E63946]/30 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle size={48} className="text-[#E63946] mx-auto mb-4" />
          <h2 className="font-display text-heading-s text-white">INVITE ERROR</h2>
          <p className="text-[#64748B] mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-heading-s text-white">YOU'RE IN!</h2>
          <p className="text-[#64748B] mt-2">Redirecting to your portal...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-heading-m text-white text-center">JOIN XPRESSMEN</h1>
          <p className="text-body-m text-[#64748B] text-center mt-2">
            Your referral code will be <span className="text-[#E63946] font-mono">{invite?.code}</span>
          </p>
        </motion.div>

        <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-6 mt-8">
          {error && (
            <div className="mb-4 p-3 bg-[#E63946]/10 border border-[#E63946]/30 rounded-lg text-[#E63946] text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <input className="input-field" placeholder="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />

            <button type="submit" disabled={submitting} className="w-full btn-primary justify-center">
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
