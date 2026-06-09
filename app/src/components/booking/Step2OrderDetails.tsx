import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookingStore } from '@/store/bookingStore';
import { useEffect } from 'react';

const schema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  orderNumber: z.string().optional(),
  itemDescription: z.string().min(5, 'Please describe your items'),
});

type FormData = z.infer<typeof schema>;

export default function Step2OrderDetails({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const orderDetails = useBookingStore((s) => s.orderDetails);
  const setOrderDetails = useBookingStore((s) => s.setOrderDetails);

  const { register, watch, formState: { isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      storeName: orderDetails?.storeName || '',
      orderNumber: orderDetails?.orderNumber || '',
      itemDescription: orderDetails?.itemDescription || '',
    },
  });

  const values = watch();

  useEffect(() => {
    onValidationChange(isValid);
    if (values.storeName || values.itemDescription) {
      setOrderDetails({
        storeName: values.storeName,
        orderNumber: values.orderNumber || undefined,
        itemDescription: values.itemDescription,
      });
    }
  }, [values, isValid, onValidationChange, setOrderDetails]);

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">ORDER INFORMATION</h2>
      <p className="text-body-m text-[#64748B] mt-1">Help us locate and prepare your delivery</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="label-text">RETAILER / STORE NAME</label>
          <input {...register('storeName')} className="input-field" placeholder="e.g., Ashley Furniture Homestore" />
        </div>

        <div>
          <label className="label-text">ORDER NUMBER (IF AVAILABLE)</label>
          <input {...register('orderNumber')} className="input-field" placeholder="e.g., AF-28475621" />
        </div>

        <div>
          <label className="label-text">WHAT ITEMS ARE BEING DELIVERED?</label>
          <textarea {...register('itemDescription')} rows={3} className="input-field resize-none" placeholder="e.g., Sectional sofa, dining table with 6 chairs, king bed frame..." />
        </div>

        <p className="text-body-s text-[#64748B] italic">
          Don&apos;t have an order number? No problem — just describe what you need.
        </p>
      </div>
    </div>
  );
}
