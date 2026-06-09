import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const roomTypes = [
  { id: 'living-room', label: 'LIVING ROOM', image: '/assets/room-living-room.jpg' },
  { id: 'bedroom', label: 'BEDROOM', image: '/assets/room-bedroom.jpg' },
  { id: 'dining-room', label: 'DINING ROOM', image: '/assets/room-dining-room.jpg' },
  { id: 'home-office', label: 'HOME OFFICE', image: '/assets/room-home-office.jpg' },
  { id: 'entryway', label: 'ENTRYWAY', image: '/assets/room-entryway.jpg' },
  { id: 'basement', label: 'BASEMENT', image: '/assets/room-living-room.jpg' },
  { id: 'other', label: 'OTHER', image: '/assets/room-bedroom.jpg' },
];

// Hotspot positions as percentages for each room type
const hotspots: Record<string, { x: number; y: number; label: string }[]> = {
  'living-room': [
    { x: 55, y: 30, label: 'Against Back Wall' },
    { x: 50, y: 55, label: 'Center of Room' },
    { x: 75, y: 45, label: 'Near Window' },
    { x: 25, y: 60, label: 'By Entry Door' },
  ],
  'bedroom': [
    { x: 50, y: 55, label: 'Center of Main Wall' },
    { x: 75, y: 35, label: 'By Closet' },
    { x: 20, y: 45, label: 'Near Window Wall' },
    { x: 60, y: 25, label: 'Opposite Dresser' },
  ],
  'dining-room': [
    { x: 50, y: 55, label: 'Center of Room' },
    { x: 30, y: 75, label: 'Near Entry' },
    { x: 70, y: 35, label: 'By Sideboard' },
    { x: 55, y: 40, label: 'Under Chandelier' },
  ],
  'home-office': [
    { x: 65, y: 50, label: 'By Window' },
    { x: 35, y: 40, label: 'Against Wall' },
    { x: 50, y: 65, label: 'Center of Room' },
    { x: 20, y: 55, label: 'Near Bookshelf' },
  ],
  'entryway': [
    { x: 50, y: 40, label: 'Against Console Wall' },
    { x: 35, y: 65, label: 'Near Shoe Bench' },
    { x: 65, y: 55, label: 'By Closet' },
  ],
  'basement': [
    { x: 50, y: 50, label: 'Center Area' },
    { x: 30, y: 35, label: 'Against Wall' },
    { x: 70, y: 60, label: 'Near Stairs' },
  ],
  'other': [
    { x: 50, y: 50, label: 'Main Area' },
    { x: 30, y: 40, label: 'Corner Placement' },
  ],
};

const considerationsList = [
  'Narrow staircase',
  'Tight doorways',
  'Elevator access',
  'Ground floor (no stairs)',
  'Multiple flights of stairs',
  'Disassembly required',
];

export default function Step4RoomSelection({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const roomSelection = useBookingStore((s) => s.roomSelection);
  const setRoomSelection = useBookingStore((s) => s.setRoomSelection);
  const [activeRoom, setActiveRoom] = useState(roomSelection?.roomType || 'living-room');
  const [placements, setPlacements] = useState<string[]>(roomSelection?.placements || []);
  const [considerations, setConsiderations] = useState<string[]>(roomSelection?.considerations || []);
  const [description, setDescription] = useState(roomSelection?.description || '');
  const [showTextFallback, setShowTextFallback] = useState(false);

  useEffect(() => {
    onValidationChange(true);
    setRoomSelection({
      roomType: activeRoom,
      placements,
      considerations,
      description: description || undefined,
    });
  }, [activeRoom, placements, considerations, description, onValidationChange, setRoomSelection]);

  const togglePlacement = (label: string) => {
    if (placements.includes(label)) {
      setPlacements(placements.filter((p) => p !== label));
    } else if (placements.length < 3) {
      setPlacements([...placements, label]);
    }
  };

  const toggleConsideration = (item: string) => {
    if (considerations.includes(item)) {
      setConsiderations(considerations.filter((c) => c !== item));
    } else {
      setConsiderations([...considerations, item]);
    }
  };

  const currentHotspots = hotspots[activeRoom] || [];
  const roomLabel = roomTypes.find((r) => r.id === activeRoom)?.label || '';

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">WHERE IS THE FURNITURE GOING?</h2>
      <p className="text-body-m text-[#64748B] mt-1">Select a room, then tap where the furniture should go.</p>

      {/* Room Type Selector */}
      <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
        {roomTypes.map((room) => (
          <button
            key={room.id}
            onClick={() => { setActiveRoom(room.id); setPlacements([]); }}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-display text-sm tracking-wider transition-all duration-200 ${
              activeRoom === room.id
                ? 'bg-[#E63946] text-white'
                : 'bg-white border border-[rgba(15,29,50,0.2)] text-[#0A1628] hover:border-[#E63946]/50'
            }`}
          >
            {room.label}
          </button>
        ))}
      </div>

      {/* Room Diagram with Hotspots */}
      <div className="mt-6 relative rounded-2xl overflow-hidden bg-white border border-[rgba(15,29,50,0.1)]">
        <div className="relative">
          <img
            src={roomTypes.find((r) => r.id === activeRoom)?.image}
            alt={`${roomLabel} diagram`}
            className="w-full aspect-[3/2] object-cover"
          />
          {/* Hotspots */}
          {currentHotspots.map((spot, i) => (
            <motion.button
              key={`${activeRoom}-${spot.label}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 15 }}
              onClick={() => togglePlacement(spot.label)}
              className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all duration-200 group ${
                placements.includes(spot.label)
                  ? 'bg-[#E63946] border-[#E63946]'
                  : 'bg-[rgba(230,57,70,0.1)] border-[#E63946] hover:bg-[rgba(230,57,70,0.25)]'
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              title={spot.label}
            >
              {!placements.includes(spot.label) && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-full h-full rounded-full border border-[#E63946]/50 absolute"
                />
              )}
              {placements.includes(spot.label) && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L6 11L12 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {spot.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Placements */}
      {placements.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <AnimatePresence>
            {placements.map((p) => (
              <motion.span
                key={p}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="inline-flex items-center gap-1.5 bg-white border border-[#E63946] rounded-full px-4 py-1.5 text-sm text-[#0A1628]"
              >
                {p}
                <button onClick={() => togglePlacement(p)} className="hover:text-[#E63946]">
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Text Fallback */}
      <button
        onClick={() => setShowTextFallback(!showTextFallback)}
        className="text-body-s text-[#E63946] mt-4 underline hover:no-underline"
      >
        {showTextFallback ? 'Hide' : 'Or describe the placement'}
      </button>
      <AnimatePresence>
        {showTextFallback && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-field resize-none mt-2"
              placeholder="Describe where the furniture should go..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Considerations */}
      <div className="mt-6">
        <label className="label-text mb-3">ANY SPECIAL CONSIDERATIONS?</label>
        <div className="flex flex-wrap gap-3">
          {considerationsList.map((item) => (
            <button
              key={item}
              onClick={() => toggleConsideration(item)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                considerations.includes(item)
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white border border-[rgba(15,29,50,0.2)] text-[#0A1628] hover:border-[#E63946]/50'
              }`}
            >
              {considerations.includes(item) && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
