import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useBookingStore } from '@/store/bookingStore';
import StepIndicator from '@/components/StepIndicator';
import Step1ServiceType from '@/components/booking/Step1ServiceType';
import Step2FurnitureSelect from '@/components/booking/Step2FurnitureSelect';
import Step2OrderDetails from '@/components/booking/Step2OrderDetails';
import Step3PhotoUpload from '@/components/booking/Step3PhotoUpload';
import Step4RoomSelection from '@/components/booking/Step4RoomSelection';
import Step5AdditionalDetails from '@/components/booking/Step5AdditionalDetails';
import Step6Schedule from '@/components/booking/Step6Schedule';
import Step7ContactInfo from '@/components/booking/Step7ContactInfo';
import Step8ReviewConfirm from '@/components/booking/Step8ReviewConfirm';
import ConfirmationScreen from '@/components/booking/ConfirmationScreen';

const allStepLabels = ['Service', 'Items', 'Order Info', 'Photos', 'Room', 'Details', 'Schedule', 'Contact', 'Review'];

export default function BookingWizardShell() {
  const [searchParams] = useSearchParams();
  const currentStep = useBookingStore((s) => s.currentStep);
  const serviceType = useBookingStore((s) => s.serviceType);
  const nextStep = useBookingStore((s) => s.nextStep);
  const prevStep = useBookingStore((s) => s.prevStep);
  const isComplete = useBookingStore((s) => s.isComplete);
  const setStep = useBookingStore((s) => s.setStep);
  const setAffiliateCode = useBookingStore((s) => s.setAffiliateCode);
  const items = useBookingStore((s) => s.items);
  const schedule = useBookingStore((s) => s.schedule);
  const contactInfo = useBookingStore((s) => s.contactInfo);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setAffiliateCode(ref.toUpperCase());
  }, [searchParams, setAffiliateCode]);

  const hasDelivery = serviceType.includes('delivery');
  const skipOrderInfo = !hasDelivery && serviceType.length > 0;

  // Build visible step list and mapping
  const visibleSteps: { label: string; actual: number }[] = [];
  for (let i = 1; i <= 9; i++) {
    if (i === 3 && skipOrderInfo) continue; // skip order info step
    visibleSteps.push({ label: allStepLabels[i - 1], actual: i });
  }

  const currentVisibleIndex = visibleSteps.findIndex((s) => s.actual === currentStep);
  const currentVisibleStep = currentVisibleIndex >= 0 ? currentVisibleIndex + 1 : visibleSteps.length;

  // Validation
  useEffect(() => {
    switch (currentStep) {
      case 1: setCanProceed(serviceType.length > 0); break;
      case 2: setCanProceed(items.length > 0); break;
      case 3: setCanProceed(true); break;
      case 4: setCanProceed(true); break;
      case 5: setCanProceed(true); break;
      case 6: setCanProceed(true); break;
      case 7: setCanProceed(schedule !== null); break;
      case 8: setCanProceed(contactInfo !== null); break;
      case 9: setCanProceed(false); break; // needs terms
      default: setCanProceed(true);
    }
  }, [currentStep, serviceType, items, schedule, contactInfo]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1ServiceType onValidationChange={setCanProceed} />;
      case 2: return <Step2FurnitureSelect onValidationChange={setCanProceed} />;
      case 3: return <Step2OrderDetails onValidationChange={setCanProceed} />;
      case 4: return <Step3PhotoUpload onValidationChange={setCanProceed} />;
      case 5: return <Step4RoomSelection onValidationChange={setCanProceed} />;
      case 6: return <Step5AdditionalDetails onValidationChange={setCanProceed} />;
      case 7: return <Step6Schedule onValidationChange={setCanProceed} />;
      case 8: return <Step7ContactInfo onValidationChange={setCanProceed} />;
      case 9: return <Step8ReviewConfirm onValidationChange={setCanProceed} />;
      case 10: return <ConfirmationScreen />;
      default: return null;
    }
  };

  const navLabel = currentStep === 8 ? 'Review Booking' : currentStep === 9 ? 'Confirm & Book' : 'Continue';

  return (
    <div className="max-w-[720px] mx-auto px-4">
      {!isComplete && currentStep <= 9 && (
        <StepIndicator
          currentStep={currentVisibleStep}
          totalSteps={visibleSteps.length}
          labels={visibleSteps.map((s) => s.label)}
          onStepClick={(visualStep) => {
            const target = visibleSteps[visualStep - 1];
            if (target && target.actual < currentStep) setStep(target.actual);
          }}
        />
      )}

      <div className="mt-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {!isComplete && currentStep <= 9 && (
        <div className="flex justify-between mt-8 pb-10">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg border-2 border-[#0A1628] text-[#0A1628] font-display text-label transition-all duration-300 ${
              currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#0A1628] hover:text-white'
            }`}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-lg font-display text-label transition-all duration-300 ${
              canProceed
                ? 'bg-[#E63946] text-white hover:bg-[#C1121F] hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {navLabel}
          </button>
        </div>
      )}
    </div>
  );
}
