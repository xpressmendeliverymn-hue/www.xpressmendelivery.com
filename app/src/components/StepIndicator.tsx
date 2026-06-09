import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  onStepClick: (step: number) => void;
}

export default function StepIndicator({ currentStep, totalSteps, labels, onStepClick }: StepIndicatorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[rgba(15,29,50,0.1)] px-4 py-5">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-[3px] bg-[rgba(203,213,225,0.3)] rounded-full" />
        {/* Progress Line Fill */}
        <motion.div
          className="absolute top-5 left-0 h-[3px] bg-[#E63946] rounded-full origin-left"
          animate={{ scaleX: Math.max(0, (currentStep - 1) / (totalSteps - 1)) }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%' }}
        />

        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isClickable = isCompleted;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <motion.button
                onClick={() => isClickable && onStepClick(stepNum)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#10B981] text-white'
                    : isActive
                    ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30'
                    : 'bg-[#E2E8F0] text-[#64748B]'
                } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                whileHover={isClickable ? { scale: 1.1 } : {}}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </motion.button>
              <span className={`text-[10px] font-display tracking-wider hidden sm:block ${
                isActive ? 'text-[#E63946]' : isCompleted ? 'text-[#10B981]' : 'text-[#64748B]'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
