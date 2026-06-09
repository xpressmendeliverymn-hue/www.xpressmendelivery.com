import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'BOOK ONLINE',
    desc: 'Answer a few questions about your delivery or removal. Upload photos of your items. Pick your preferred time slot.',
  },
  {
    num: '02',
    title: 'WE CONFIRM',
    desc: 'Our team reviews your request, prepares the route, and sends you a confirmation with your delivery window and crew details.',
  },
  {
    num: '03',
    title: 'WE DELIVER',
    desc: 'Our professional crew arrives on time, handles your furniture with care, places it exactly where you want it, and cleans up.',
  },
  {
    num: '04',
    title: 'YOU RELAX',
    desc: 'Everything is in its place. Rate your experience and get automatic reminders for any future services you scheduled.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-cream">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <ScrollReveal className="text-center mb-16">
          <span className="text-label text-[#E63946] tracking-widest">THE PROCESS</span>
          <h2 className="text-heading-m text-[#0A1628] mt-2">HOW XPRESSMEN WORKS</h2>
        </ScrollReveal>

        <div className="relative">
          <StaggerContainer className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-[60px] left-[12%] right-[12%] h-[3px] bg-gradient-to-r from-[#E63946] via-[#E63946]/50 to-[#E63946]/20 z-0" />

            {steps.map((step) => (
              <StaggerItem key={step.num} className="relative z-10">
                <div className="text-center">
                  <span className="font-mono text-display-l text-[rgba(230,57,70,0.12)] block leading-none select-none">
                    {step.num}
                  </span>
                  <h3 className="font-display text-heading-s text-[#0A1628] mt-2">{step.title}</h3>
                  <p className="text-body-m text-[#64748B] mt-3">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 z-20"
          >
            <motion.img
              src="/assets/phone-mockup.png"
              alt="Booking app"
              className="w-[240px] drop-shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
