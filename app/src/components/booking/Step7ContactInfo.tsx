import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Step7ContactInfo({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const contactInfo = useBookingStore((s) => s.contactInfo);
  const setContactInfo = useBookingStore((s) => s.setContactInfo);

  const [firstName, setFirstName] = useState(contactInfo?.firstName || '');
  const [lastName, setLastName] = useState(contactInfo?.lastName || '');
  const [phone, setPhone] = useState(contactInfo?.phone || '');
  const [email, setEmail] = useState(contactInfo?.email || '');
  const [address, setAddress] = useState(contactInfo?.address || '');
  const [commPrefs, setCommPrefs] = useState<string[]>(contactInfo?.communicationPrefs || ['text']);

  const isValid = firstName.length > 0 && lastName.length > 0 && phone.length >= 14 && email.includes('@') && address.length > 5;

  useEffect(() => {
    onValidationChange(isValid);
    if (isValid) {
      setContactInfo({ firstName, lastName, phone, email, address, communicationPrefs: commPrefs });
    }
  }, [firstName, lastName, phone, email, address, commPrefs, isValid, onValidationChange, setContactInfo]);

  const toggleCommPref = (pref: string) => {
    if (commPrefs.includes(pref)) {
      setCommPrefs(commPrefs.filter((p) => p !== pref));
    } else {
      setCommPrefs([...commPrefs, pref]);
    }
  };

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">YOUR CONTACT INFO</h2>
      <p className="text-body-m text-[#64748B] mt-1">We&apos;ll send confirmations and reminders to these details.</p>

      <div className="mt-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">FIRST NAME *</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" placeholder="John" />
          </div>
          <div>
            <label className="label-text">LAST NAME *</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" placeholder="Doe" />
          </div>
        </div>

        <div>
          <label className="label-text">PHONE NUMBER *</label>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className="input-field"
            placeholder="(763) 325-3960"
          />
          <p className="text-body-s text-[#64748B] mt-1">We&apos;ll text you reminders and updates</p>
        </div>

        <div>
          <label className="label-text">EMAIL ADDRESS *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="input-field"
            placeholder="you@example.com"
          />
          <p className="text-body-s text-[#64748B] mt-1">For confirmation and receipt</p>
        </div>

        <div>
          <label className="label-text">DELIVERY / PICKUP ADDRESS *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="Full street address in Minneapolis area"
          />
        </div>

        <div>
          <label className="label-text">HOW SHOULD WE CONTACT YOU?</label>
          <div className="space-y-2 mt-2">
            {[
              { id: 'text', label: 'Text messages for reminders and updates' },
              { id: 'email', label: 'Email for confirmation and receipt' },
              { id: 'phone', label: 'Phone call for urgent changes only' },
            ].map((pref) => (
              <label key={pref.id} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => toggleCommPref(pref.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 ${
                    commPrefs.includes(pref.id)
                      ? 'bg-[#E63946]'
                      : 'border-2 border-[rgba(15,29,50,0.3)]'
                  }`}
                >
                  {commPrefs.includes(pref.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-body-m text-[#0A1628]">{pref.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
