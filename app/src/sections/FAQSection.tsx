import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'How do I schedule a delivery?',
    a: "Simply click 'Book a Delivery' and complete our guided intake. You'll answer a few questions, upload photos of your items, select your room placement, and pick a time slot. Our system handles the rest — confirmation, reminders, and updates.",
  },
  {
    q: 'What areas do you serve?',
    a: 'We serve the entire Minneapolis-Saint Paul metro area including Minneapolis, St. Paul, Bloomington, Brooklyn Park, Plymouth, Maple Grove, Eden Prairie, and surrounding cities. Not sure if we cover your area? Give us a call at (763) 325-3960.',
  },
  {
    q: 'Can you remove old furniture when delivering new furniture?',
    a: "Absolutely! Just select both 'Delivery' and 'Removal' during booking. We'll remove your old furniture and deliver the new pieces in the same visit, saving you time and money.",
  },
  {
    q: 'What is White Glove service?',
    a: 'Our White Glove service includes full assembly, room placement, debris removal, and basic cleanup. We place your furniture exactly where you want it and leave your space spotless.',
  },
  {
    q: 'How does the photo upload work?',
    a: 'During booking, you can upload photos of your items and rooms. Our system analyzes the photos to determine size, weight, and any special handling requirements. This helps us arrive prepared with the right crew and equipment.',
  },
  {
    q: 'What if I need to reschedule?',
    a: "No problem! You'll receive a reschedule link in your confirmation email and reminder texts. You can change your slot up to 24 hours before your scheduled delivery at no charge.",
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: typeof faqs[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={`font-display text-heading-s transition-colors duration-200 ${isOpen ? 'text-[#E63946]' : 'text-white group-hover:text-[#E63946]'}`}>
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white flex-shrink-0 ml-4"
        >
          <Plus size={24} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-body-m text-[#CBD5E1] pb-5 pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-dark">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left Text */}
          <ScrollReveal className="lg:col-span-2">
            <span className="text-label text-[#E63946] tracking-widest">FAQ</span>
            <h2 className="text-heading-m text-white mt-2">QUESTIONS? ANSWERS.</h2>
            <p className="text-body-l text-[#CBD5E1] mt-4">
              Everything you need to know about our delivery and removal services.
            </p>
            <a
              href="tel:+17633253960"
              className="btn-secondary text-label mt-8 inline-flex"
            >
              Still have questions? Call us
            </a>
          </ScrollReveal>

          {/* Accordion */}
          <div className="lg:col-span-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <AccordionItem
                  item={faq}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
