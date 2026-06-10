import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';

export default function Step2OrderDetails({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const orderDetails = useBookingStore((s) => s.orderDetails);
  const setOrderDetails = useBookingStore((s) => s.setOrderDetails);

  const [storeName, setStoreName] = useState(orderDetails?.storeName || '');
  const [orderNumber, setOrderNumber] = useState(orderDetails?.orderNumber || '');
  const [itemDescription, setItemDescription] = useState(orderDetails?.itemDescription || '');

  const isValid = storeName.length > 0 && itemDescription.length >= 5;

  useEffect(() => {
    onValidationChange(isValid);
    if (storeName || itemDescription) {
      setOrderDetails({
        storeName,
        orderNumber: orderNumber || undefined,
        itemDescription,
      });
    }
  }, [storeName, orderNumber, itemDescription, isValid, onValidationChange, setOrderDetails]);

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">ORDER INFORMATION</h2>
      <p className="text-body-m text-[#64748B] mt-1">Help us locate and prepare your delivery</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="label-text">RETAILER / STORE NAME</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="input-field"
            placeholder="e.g., Ashley Furniture Homestore"
          />
        </div>

        <div>
          <label className="label-text">ORDER NUMBER (IF AVAILABLE)</label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="input-field"
            placeholder="e.g., AF-28475621"
          />
        </div>

        <div>
          <label className="label-text">WHAT ITEMS ARE BEING DELIVERED?</label>
          <textarea
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="e.g., Sectional sofa, dining table with 6 chairs, king bed frame..."
          />
        </div>

        <p className="text-body-s text-[#64748B] italic">
          Don&apos;t have an order number? No problem — just describe what you need.
        </p>
      </div>
    </div>
  );
}
