import { useState, useEffect, useMemo } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay, addDays, isSameDay, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { scheduleApi } from '@/services/api';

export default function Step6Schedule({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const schedule = useBookingStore((s) => s.schedule);
  const setSchedule = useBookingStore((s) => s.setSchedule);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(schedule?.date || null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(schedule?.timeSlot || null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    onValidationChange(selectedDate !== null && selectedSlot !== null);
    if (selectedDate && selectedSlot) {
      setSchedule({ date: selectedDate, timeSlot: selectedSlot });
    }
  }, [selectedDate, selectedSlot, onValidationChange, setSchedule]);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      scheduleApi.available(format(selectedDate, 'yyyy-MM-dd'))
        .then((slots) => {
          setAvailableSlots(slots);
        })
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 14);

  const isDateAvailable = (date: Date) => {
    return !isBefore(date, today) && !isBefore(maxDate, date);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const groupedSlots = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const slot of availableSlots) {
      if (!groups[slot.time_slot]) groups[slot.time_slot] = [];
      groups[slot.time_slot].push(slot);
    }
    return groups;
  }, [availableSlots]);

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">PICK YOUR TIME</h2>
      <p className="text-body-m text-[#64748B] mt-1">Select a date, then choose your preferred time window.</p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-[rgba(15,29,50,0.1)] p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
              <ChevronLeft size={20} className="text-[#0A1628]" />
            </button>
            <span className="font-display text-lg text-[#0A1628]">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
              <ChevronRight size={20} className="text-[#0A1628]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] font-display text-[#64748B] tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          <motion.div
            key={format(currentMonth, 'MM-yyyy')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((day) => {
              const available = isDateAvailable(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => { available && setSelectedDate(day); setSelectedSlot(null); }}
                  disabled={!available}
                  className={`relative aspect-square rounded-xl flex items-center justify-center text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#E63946] text-white'
                      : isToday
                      ? 'border-2 border-[#E63946] text-[#E63946]'
                      : available
                      ? 'bg-white text-[#0A1628] border border-[rgba(15,29,50,0.1)] hover:bg-[rgba(230,57,70,0.05)]'
                      : 'text-[#CBD5E1] cursor-not-allowed'
                  }`}
                >
                  {format(day, 'd')}
                  {available && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#E63946]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Time Slots */}
        <div>
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-display text-heading-s text-[#0A1628] mb-4">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                {loadingSlots ? (
                  <p className="text-[#64748B]">Loading slots...</p>
                ) : Object.keys(groupedSlots).length === 0 ? (
                  <p className="text-[#64748B]">No available slots for this date.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(groupedSlots).map(([time, slots], i) => {
                      const isSelected = selectedSlot === time;
                      const crewCount = slots.length;
                      return (
                        <motion.button
                          key={time}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          onClick={() => setSelectedSlot(time)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-[#E63946] bg-[rgba(230,57,70,0.03)]'
                              : 'border-[rgba(15,29,50,0.1)] bg-white hover:border-[#E63946]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#0A1628]">{time}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              crewCount <= 1
                                ? 'bg-[rgba(230,57,70,0.1)] text-[#E63946]'
                                : 'bg-[rgba(16,185,129,0.1)] text-[#10B981]'
                            }`}>
                              {crewCount} crew{crewCount > 1 ? 's' : ''} available
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="8" fill="#E63946" />
                                <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#64748B] text-body-m">
                Select a date to see available time slots
              </div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-4 text-body-s text-[#64748B]">
            <RefreshCw size={14} />
            <span>Slots update in real-time based on our crew&apos;s current routes</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
          </div>

          <p className="text-body-s text-[#64748B] mt-3">
            Need to reschedule later? No problem — call us or your salesperson can update it.
          </p>
        </div>
      </div>
    </div>
  );
}
