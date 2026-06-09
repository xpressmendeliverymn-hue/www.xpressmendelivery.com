import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';

const messages = [
  { from: 'bot', text: 'Hi! What can we help you with today?' },
  { from: 'user', text: 'I need a sofa delivered' },
  { from: 'bot', text: 'Great! Which room should it go in?' },
  { from: 'user', text: 'Living room' },
  { from: 'bot', text: 'Perfect. Here are your available slots:' },
];

export default function InteractivePreviewSection() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let count = 0;
    const showNext = () => {
      if (count < messages.length) {
        setIsTyping(true);
        setTimeout(() => {
          count++;
          setVisibleCount(count);
          setIsTyping(false);
          setTimeout(showNext, 1200);
        }, 600);
      } else {
        setTimeout(() => {
          count = 0;
          setVisibleCount(0);
          setTimeout(showNext, 500);
        }, 3000);
      }
    };
    const timer = setTimeout(showNext, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-[#0A1628]" style={{ padding: '100px 0' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <ScrollReveal>
            <span className="text-label text-[#E63946] tracking-widest">SMART BOOKING</span>
            <h2 className="text-heading-m text-white mt-2">LET OUR SYSTEM DO THE WORK</h2>
            <p className="text-body-l text-[#CBD5E1] mt-4 mb-8">
              No more phone tag. Our intelligent intake asks the right questions, reads your photos, and finds the perfect time slot — automatically.
            </p>
            <Link to="/booking" className="btn-primary text-label">
              START YOUR BOOKING
            </Link>
          </ScrollReveal>

          {/* Chat Preview */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="w-full max-w-[360px] mx-auto rounded-3xl bg-[#0F1D32] border border-white/10 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-[#162540] px-5 py-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#E63946] flex items-center justify-center">
                  <span className="font-display text-xs text-white">XM</span>
                </div>
                <div>
                  <p className="font-display text-sm text-white tracking-wider">XPRESSMEN</p>
                  <p className="text-[10px] text-[#10B981]">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[320px] max-h-[380px] overflow-hidden">
                <AnimatePresence>
                  {messages.slice(0, visibleCount).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-body-s ${
                          msg.from === 'user'
                            ? 'bg-[#E63946] text-white rounded-br-md'
                            : 'bg-[#1A2E4A] text-[#CBD5E1] rounded-bl-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && visibleCount < messages.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#1A2E4A] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="w-2 h-2 rounded-full bg-[#64748B]"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Bar */}
              <div className="px-4 py-3 border-t border-white/5">
                <div className="bg-[#1A2E4A] rounded-full px-4 py-2.5 text-body-s text-[#64748B]">
                  Type your answer...
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
