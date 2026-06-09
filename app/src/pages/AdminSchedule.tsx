import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scheduleApi } from '@/services/api';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

export default function AdminSchedule() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slots, setSlots] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadSlots();
  }, [isAuthenticated, user, navigate, weekStart]);

  const loadSlots = async () => {
    setIsLoading(true);
    const from = format(weekStart, 'yyyy-MM-dd');
    const to = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    try {
      const data = await scheduleApi.list({ dateFrom: from, dateTo: to });
      setSlots(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const crews = ['Crew A', 'Crew B', 'Crew C'];
  const timeSlots = ['8:00 AM - 11:00 AM', '1:00 PM - 4:00 PM'];

  const getSlot = (date: Date, crew: string, time: string) => {
    return slots.find(
      (s) => s.date === format(date, 'yyyy-MM-dd') && s.crew_name === crew && s.time_slot === time
    );
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-heading-m text-white">CREW SCHEDULE</h1>
            <Link to="/admin" className="text-sm text-[#64748B] hover:text-white">← Back to Dashboard</Link>
          </div>
        </motion.div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-white font-medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-label text-[#64748B] text-xs p-2">CREW / TIME</div>
              {days.map((day) => (
                <div key={day.toISOString()} className={`text-center p-2 rounded-lg ${isSameDay(day, new Date()) ? 'bg-[#E63946]/20' : ''}`}>
                  <p className="text-label text-[#64748B] text-xs">{format(day, 'EEE')}</p>
                  <p className="text-white font-display text-label">{format(day, 'd')}</p>
                </div>
              ))}
            </div>

            {/* Crew rows */}
            {crews.map((crew) => (
              <div key={crew} className="mb-4">
                <p className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <User size={14} className="text-[#E63946]" />
                  {crew}
                </p>
                {timeSlots.map((time) => (
                  <div key={`${crew}-${time}`} className="grid grid-cols-8 gap-2 mb-1">
                    <div className="text-[#64748B] text-xs flex items-center">
                      <Clock size={12} className="mr-1" />
                      {time}
                    </div>
                    {days.map((day) => {
                      const slot = getSlot(day, crew, time);
                      return (
                        <div
                          key={`${crew}-${time}-${day.toISOString()}`}
                          className={`rounded-lg p-2 text-center text-xs min-h-[60px] flex flex-col items-center justify-center ${
                            slot?.status === 'booked'
                              ? 'bg-[#E63946]/20 border border-[#E63946]/30'
                              : slot?.status === 'blocked'
                              ? 'bg-gray-500/10 border border-gray-500/20'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          {slot?.status === 'booked' ? (
                            <>
                              <span className="text-[#E63946] font-medium">Booked</span>
                              <span className="text-[#64748B] text-[10px] mt-0.5">{slot.order_id?.slice(0, 6)}</span>
                            </>
                          ) : slot?.status === 'blocked' ? (
                            <span className="text-gray-500">Blocked</span>
                          ) : (
                            <span className="text-[#64748B]">Open</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
