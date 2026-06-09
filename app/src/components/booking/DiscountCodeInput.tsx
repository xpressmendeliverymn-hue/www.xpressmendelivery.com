import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, CheckCircle, XCircle } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { salespeopleApi } from '@/services/api';

export default function DiscountCodeInput() {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);
  const discountCode = useBookingStore((s) => s.discountCode);
  const discountApplied = useBookingStore((s) => s.discountApplied);
  const setDiscountCode = useBookingStore((s) => s.setDiscountCode);
  const setDiscountApplied = useBookingStore((s) => s.setDiscountApplied);
  const setAffiliateCode = useBookingStore((s) => s.setAffiliateCode);
  const items = useBookingStore((s) => s.items);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const applyCode = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const data = await salespeopleApi.validateCode(code.trim().toUpperCase());
      if (data.valid) {
        const discount = Math.round(subtotal * (data.discountPercent / 100) * 100) / 100;
        setDiscountCode(data.code);
        setDiscountApplied(discount);
        setAffiliateCode(data.code);
        setResult('valid');
      } else {
        throw new Error('Invalid');
      }
    } catch {
      setResult('invalid');
      setDiscountApplied(0);
      setDiscountCode('');
    } finally {
      setChecking(false);
    }
  };

  const removeCode = () => {
    setDiscountCode('');
    setDiscountApplied(0);
    setAffiliateCode('');
    setCode('');
    setResult(null);
  };

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {discountCode ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-white text-sm">
                Code <span className="font-mono text-green-400">{discountCode}</span> applied (-${discountApplied.toFixed(2)})
              </span>
            </div>
            <button onClick={removeCode} className="text-[#64748B] hover:text-white">
              <XCircle size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Discount code (e.g. MIKE10)"
                  className="input-field pl-9 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && applyCode()}
                />
              </div>
              <button
                onClick={applyCode}
                disabled={checking || !code.trim()}
                className="px-4 py-2 bg-[#0A1628] text-white rounded-xl text-sm font-medium hover:bg-[#E63946] transition-colors disabled:opacity-50"
              >
                {checking ? '...' : 'Apply'}
              </button>
            </div>
            {result === 'invalid' && (
              <p className="text-[#E63946] text-xs mt-2">Invalid code</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
