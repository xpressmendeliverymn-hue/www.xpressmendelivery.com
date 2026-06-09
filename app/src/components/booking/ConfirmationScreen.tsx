import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookingStore } from '@/store/bookingStore';
import { motion } from 'framer-motion';
import { Check, Clipboard, ClipboardCheck } from 'lucide-react';

const nextSteps = [
  'Confirmation text sent to your phone',
  'Reminder 24 hours before your delivery',
  'Crew arrival notification day-of',
];

export default function ConfirmationScreen() {
  const bookingReference = useBookingStore((s) => s.bookingReference);
  const reset = useBookingStore((s) => s.reset);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center py-8">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-[120px] h-[120px] mx-auto"
      >
        <div className="w-full h-full rounded-full bg-[#10B981] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <motion.svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.path
              d="M12 24L20 32L36 16"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
        animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden mt-6"
      >
        <h2 className="text-display-l text-[#0A1628]">YOU&apos;RE ALL SET!</h2>
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-body-l text-[#64748B] mt-3 max-w-md mx-auto"
      >
        Your booking has been confirmed. Our crew will arrive within your selected window and handle everything.
      </motion.p>

      {/* Booking Reference */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-6"
      >
        <span className="text-body-s text-[#64748B] uppercase tracking-wider font-display">Booking Reference</span>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="font-mono text-heading-m text-[#0A1628]">{bookingReference}</span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#E63946]"
            title="Copy reference"
          >
            {copied ? <ClipboardCheck size={18} className="text-[#10B981]" /> : <Clipboard size={18} />}
          </button>
        </div>
        {copied && <span className="text-body-s text-[#10B981] mt-1 block">Copied!</span>}
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-8 card-light max-w-md mx-auto text-left"
      >
        <h3 className="font-display text-heading-s text-[#0A1628] mb-4">WHAT HAPPENS NEXT</h3>
        <div className="space-y-3">
          {nextSteps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + i * 0.2, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-white" />
              </div>
              <span className="text-body-m text-[#0A1628]">{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="mt-8 space-y-3"
      >
        <button
          onClick={reset}
          className="w-full max-w-md py-3 rounded-xl border-2 border-[#0A1628] text-[#0A1628] font-display text-label hover:bg-[#0A1628] hover:text-white transition-all duration-300"
        >
          BOOK ANOTHER
        </button>
        <Link
          to="/"
          onClick={reset}
          className="block text-[#E63946] font-display text-label hover:text-[#C1121F] transition-colors"
        >
          RETURN HOME
        </Link>
      </motion.div>
    </div>
  );
}
