import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { format } from 'date-fns';
import { X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ordersApi } from '@/services/api';
import DiscountCodeInput from './DiscountCodeInput';

export default function Step8ReviewConfirm({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const store = useBookingStore();
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onValidationChange(agreed && !isSubmitting);
  }, [agreed, isSubmitting, onValidationChange]);

  const subtotal = store.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = store.discountApplied || 0;
  const taxRate = 0.085;
  const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
  const total = Math.round((subtotal - discount + tax) * 100) / 100;

  const handleConfirm = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        serviceType: store.serviceType,
        items: store.items.map((i) => ({
          category: i.category,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          action: i.action,
        })),
        pricing: {
          subtotal,
          discount,
          discountCode: store.discountCode || undefined,
          tax,
          total,
        },
        affiliateCode: store.affiliateCode || undefined,
        photos: store.photos.map((p) => ({
          url: p.url,
          aiDescription: p.aiDescription,
          status: p.status,
        })),
        roomSelection: store.roomSelection,
        schedule: store.schedule
          ? {
              date: format(store.schedule.date, 'yyyy-MM-dd'),
              timeSlot: store.schedule.timeSlot,
            }
          : null,
        contactInfo: store.contactInfo,
        additionalDetails: store.additionalDetails,
        orderDetails: store.orderDetails,
      };

      const res = await ordersApi.create(payload);
      toast.success(`Booking confirmed! Reference: ${res.reference}`);
      store.completeBooking(res.reference);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
      toast.error(err.message || 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceLabels: Record<string, string> = {
    delivery: 'Furniture Delivery',
    removal: 'Furniture Removal',
  };

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">REVIEW YOUR BOOKING</h2>
      <p className="text-body-m text-[#64748B] mt-1">Everything look good? Click Confirm to book.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 bg-white rounded-2xl shadow-sm border border-[rgba(15,29,50,0.08)] p-6 space-y-5"
      >
        {/* Service */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(15,29,50,0.08)]">
          <div>
            <span className="text-label text-[#E63946] text-sm">SERVICE</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {store.serviceType.map((s) => (
                <span key={s} className="px-3 py-1 bg-[#F1F5F9] rounded-full text-sm text-[#0A1628]">
                  {serviceLabels[s]}
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => store.setStep(1)} className="text-sm text-[#E63946] hover:underline">Edit</button>
        </div>

        {/* Items */}
        {store.items.length > 0 && (
          <div className="pb-4 border-b border-[rgba(15,29,50,0.08)]">
            <div className="flex items-start justify-between">
              <span className="text-label text-[#E63946] text-sm">ITEMS</span>
              <button onClick={() => store.setStep(2)} className="text-sm text-[#E63946] hover:underline">Edit</button>
            </div>
            <div className="space-y-2 mt-2">
              {store.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#0A1628]">{item.name} × {item.quantity} ({item.action})</span>
                  <span className="text-[#64748B]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Details */}
        {store.orderDetails && (
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(15,29,50,0.08)]">
            <div>
              <span className="text-label text-[#E63946] text-sm">STORE ORDER</span>
              <p className="text-body-m text-[#0A1628] mt-1">{store.orderDetails.storeName}</p>
              <p className="text-body-s text-[#64748B]">{store.orderDetails.orderNumber}</p>
              <p className="text-body-s text-[#64748B]">{store.orderDetails.itemDescription}</p>
            </div>
            <button onClick={() => store.setStep(3)} className="text-sm text-[#E63946] hover:underline flex-shrink-0">Edit</button>
          </div>
        )}

        {/* Room */}
        {store.roomSelection && (
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(15,29,50,0.08)]">
            <div>
              <span className="text-label text-[#E63946] text-sm">ROOM PLACEMENT</span>
              <p className="text-body-m text-[#0A1628] mt-1 capitalize">
                {store.roomSelection.roomType.replace('-', ' ')}
              </p>
              {store.roomSelection.placements.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {store.roomSelection.placements.map((p) => (
                    <span key={p} className="text-body-s text-[#64748B]">• {p}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => store.setStep(5)} className="text-sm text-[#E63946] hover:underline flex-shrink-0">Edit</button>
          </div>
        )}

        {/* Schedule */}
        {store.schedule && (
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(15,29,50,0.08)]">
            <div>
              <span className="text-label text-[#E63946] text-sm">SCHEDULED TIME</span>
              <p className="text-body-m text-[#0A1628] mt-1 font-medium">
                {format(store.schedule.date, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-body-s text-[#64748B]">{store.schedule.timeSlot}</p>
            </div>
            <button onClick={() => store.setStep(7)} className="text-sm text-[#E63946] hover:underline flex-shrink-0">Edit</button>
          </div>
        )}

        {/* Contact */}
        {store.contactInfo && (
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(15,29,50,0.08)]">
            <div>
              <span className="text-label text-[#E63946] text-sm">CONTACT</span>
              <div className="text-body-s text-[#0A1628] mt-1 space-y-0.5">
                <p className="font-medium">{store.contactInfo.firstName} {store.contactInfo.lastName}</p>
                <p>{store.contactInfo.phone}</p>
                <p>{store.contactInfo.email}</p>
                <p className="text-[#64748B]">{store.contactInfo.address}</p>
              </div>
            </div>
            <button onClick={() => store.setStep(8)} className="text-sm text-[#E63946] hover:underline flex-shrink-0">Edit</button>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="bg-[#F1F5F9] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Subtotal</span>
            <span className="text-[#0A1628]">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount {store.discountCode && `(${store.discountCode})`}</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Tax (8.5%)</span>
            <span className="text-[#0A1628]">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-medium pt-2 border-t border-[rgba(15,29,50,0.1)]">
            <span className="text-[#0A1628] font-display text-label">TOTAL</span>
            <span className="text-[#E63946] font-display text-label">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount Code */}
        <DiscountCodeInput />
      </motion.div>

      {/* Terms */}
      <div className="mt-6 flex items-start gap-3">
        <button
          onClick={() => setAgreed(!agreed)}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            agreed ? 'bg-[#E63946]' : 'border-2 border-[rgba(15,29,50,0.3)]'
          }`}
        >
          {agreed && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <p className="text-body-m text-[#0A1628]">
          I agree to the{' '}
          <button onClick={() => setShowTerms(true)} className="text-[#E63946] underline">
            service terms and disclaimer
          </button>
        </p>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!agreed || isSubmitting}
        className={`w-full mt-6 py-4 rounded-xl font-display text-label text-lg transition-all duration-300 ${
          agreed && !isSubmitting
            ? 'bg-[#E63946] text-white hover:bg-[#C1121F] hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            BOOKING...
          </span>
        ) : (
          'CONFIRM & BOOK'
        )}
      </button>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowTerms(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 text-[#64748B] hover:text-[#0A1628]">
                <X size={24} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-[#E63946]" />
                <h3 className="font-display text-heading-s text-[#0A1628]">Service Terms & Disclaimer</h3>
              </div>
              <p className="text-body-s text-[#64748B] leading-relaxed">
                Prices are subject to change based on certain challenges and/or difficult obstacles upon delivery. Also, any rearranging of furniture or removals will affect billing. Customers are encouraged to inspect their merchandise before Xpressmen has left the clients&apos; homes. If manufacturer damages are discovered after Xpressmen has left, you (the client) are responsible for transportation costs related to repairs or exchanges. Xpressmen is not responsible for any damaged or missing pieces that were caused by the manufacturer and/or Ashley Furniture Store. Xpressmen also reserves the right to refuse any deliveries that may cause damage to the furniture or the client&apos;s home. Once your Xpressmen Delivery Specialist shows up to the client&apos;s home with the furniture, Xpressmen will receive at least the minimum delivery and/or removal charges up to the quoted delivery and/or removal fee for transportation and restocking costs. Xpressmen will make one service call on any defective or damaged merchandise. Xpressmen delivery specialists cannot make promises not included in this disclaimer. If a client does not agree with this disclaimer please respond by email before delivery. THIS NOTICE IS IN COMPLIANCE WITH AND SUBJECT TO UCC 1-202 AND MINNESOTA STATUTE 336.1-202.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
