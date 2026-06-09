import { useBookingStore } from '@/store/bookingStore';
import { Truck, Sofa, Layers } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const options = [
  { id: 'delivery' as const, icon: Truck, title: 'FURNITURE DELIVERY', desc: 'New furniture coming from a store or warehouse' },
  { id: 'removal' as const, icon: Sofa, title: 'FURNITURE REMOVAL', desc: 'Remove and dispose of old furniture' },
];

export default function Step1ServiceType({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const serviceType = useBookingStore((s) => s.serviceType);
  const setServiceType = useBookingStore((s) => s.setServiceType);

  useEffect(() => {
    onValidationChange(serviceType.length > 0);
  }, [serviceType, onValidationChange]);

  const toggleService = (id: 'delivery' | 'removal') => {
    if (serviceType.includes(id)) {
      setServiceType(serviceType.filter((s) => s !== id));
    } else {
      setServiceType([...serviceType, id]);
    }
  };

  const isSelected = (id: string) => serviceType.includes(id as 'delivery' | 'removal');

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628] text-center">WHAT DO YOU NEED HELP WITH?</h2>
      <p className="text-body-m text-[#64748B] text-center mt-2">Select one or more services</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggleService(opt.id)}
            className={`relative card-light text-center min-h-[200px] flex flex-col items-center justify-center transition-all duration-300 ${
              isSelected(opt.id)
                ? 'border-2 border-[#E63946] bg-[rgba(230,57,70,0.03)]'
                : 'border border-[rgba(15,29,50,0.2)] hover:border-[#E63946]/50'
            }`}
          >
            <AnimatePresence>
              {isSelected(opt.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            <opt.icon size={48} className={`mb-3 ${isSelected(opt.id) ? 'text-[#E63946]' : 'text-[#64748B]'}`} strokeWidth={1.5} />
            <h3 className="font-display text-heading-s text-[#0A1628]">{opt.title}</h3>
            <p className="text-body-m text-[#64748B] mt-1">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Both Option */}
      <button
        onClick={() => {
          if (serviceType.length === 2) {
            setServiceType([]);
          } else {
            setServiceType(['delivery', 'removal']);
          }
        }}
        className={`w-full card-light text-center mt-4 py-5 flex items-center justify-center gap-3 transition-all duration-300 ${
          serviceType.length === 2
            ? 'border-2 border-[#E63946] bg-[rgba(230,57,70,0.03)]'
            : 'border border-[rgba(15,29,50,0.2)] hover:border-[#E63946]/50'
        }`}
      >
        <AnimatePresence>
          {serviceType.length === 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
        <Layers size={28} className={serviceType.length === 2 ? 'text-[#E63946]' : 'text-[#64748B]'} strokeWidth={1.5} />
        <span className="font-display text-heading-s text-[#0A1628]">BOTH — Delivery & Removal</span>
      </button>
    </div>
  );
}
