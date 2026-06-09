import ScrollReveal from '@/components/ScrollReveal';
import { motion } from 'framer-motion';
import { Check, Phone } from 'lucide-react';

const cities = [
  'Minneapolis', 'St. Paul', 'Bloomington', 'Brooklyn Park',
  'Plymouth', 'Maple Grove', 'Eden Prairie', 'Minnetonka',
  'Edina', 'St. Louis Park', 'Richfield', 'Hopkins',
  'Crystal', 'New Hope', 'Golden Valley',
];

export default function ServiceAreasSection() {
  return (
    <section id="areas" className="section-cream">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <ScrollReveal className="mb-12">
          <span className="text-label text-[#E63946] tracking-widest">COVERAGE AREA</span>
          <h2 className="text-heading-m text-[#0A1628] mt-2">SERVING THE TWIN CITIES</h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map */}
          <ScrollReveal>
            <div className="relative">
              <motion.img
                src="/assets/minneapolis-map.jpg"
                alt="Minneapolis service area map"
                className="w-full max-w-[500px] mx-auto rounded-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Pulsing pin overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-[#E63946]" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#E63946]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* City List */}
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {cities.map((city, i) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} className="text-[#10B981] flex-shrink-0" />
                  <span className="text-body-m text-[#0A1628]">{city}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-body-m text-[#64748B] mt-6">
              Don&apos;t see your city? Call us — we likely service your area!
            </p>
            <a href="tel:+17633253960" className="inline-flex items-center gap-2 text-[#E63946] font-display text-label mt-2 hover:text-[#C1121F] transition-colors">
              <Phone size={18} />
              (763) 325-3960
            </a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
