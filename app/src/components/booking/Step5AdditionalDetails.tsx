import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';

const homeTypes = ['Single-family house', 'Townhouse / Duplex', 'Apartment / Condo', 'High-rise (elevator)', 'Other'];

export default function Step5AdditionalDetails({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const additionalDetails = useBookingStore((s) => s.additionalDetails);
  const setAdditionalDetails = useBookingStore((s) => s.setAdditionalDetails);

  const [homeType, setHomeType] = useState(additionalDetails?.homeType || '');
  const [parking, setParking] = useState(additionalDetails?.parking || '');
  const [accessNotes, setAccessNotes] = useState(additionalDetails?.accessNotes || '');
  const [specialRequests, setSpecialRequests] = useState(additionalDetails?.specialRequests || '');

  useEffect(() => {
    onValidationChange(true);
    setAdditionalDetails({
      homeType,
      parking: parking || undefined,
      accessNotes: accessNotes || undefined,
      specialRequests: specialRequests || undefined,
    });
  }, [homeType, parking, accessNotes, specialRequests, onValidationChange, setAdditionalDetails]);

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">A FEW MORE DETAILS</h2>
      <p className="text-body-m text-[#64748B] mt-1">Help our crew arrive fully prepared.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="label-text">TYPE OF HOME</label>
          <select
            value={homeType}
            onChange={(e) => setHomeType(e.target.value)}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">Select home type...</option>
            {homeTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-text">PARKING SITUATION</label>
          <input
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            className="input-field"
            placeholder="e.g., Driveway available, street parking, loading dock..."
          />
        </div>

        <div>
          <label className="label-text">ACCESS NOTES</label>
          <textarea
            value={accessNotes}
            onChange={(e) => setAccessNotes(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="e.g., Front door has 3 steps. Side entrance is level. Key code is 4721..."
          />
        </div>

        <div>
          <label className="label-text">SPECIAL REQUESTS</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="Any other details our crew should know..."
          />
        </div>
      </div>
    </div>
  );
}
