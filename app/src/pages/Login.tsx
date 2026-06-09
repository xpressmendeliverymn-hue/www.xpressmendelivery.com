import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success(`Welcome back!`);
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'salesperson') navigate('/salesperson');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-heading-m text-white">LOGIN</h1>
          <p className="text-body-m text-[#64748B] mt-2">Access your dashboard</p>
        </div>

        <div className="bg-[#0F1D32] border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-[#E63946]/10 border border-[#E63946]/30 rounded-lg flex items-center gap-2 text-[#E63946] text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center mt-6"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-[#64748B] mb-2">Demo credentials:</p>
            <div className="text-xs text-[#64748B] space-y-1">
              <p>Admin: admin@xpressmen.com / admin123</p>
              <p>Salesperson: mike@xpressmen.com / sales123</p>
              <p>Salesperson: ashley@xpressmen.com / sales123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
