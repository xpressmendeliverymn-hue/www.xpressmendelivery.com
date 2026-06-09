import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Phone } from 'lucide-react';

const clipReveal = {
  hidden: { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
  visible: {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const headlineLines = ['XPRESS DELIVERY', 'FOR LESS', 'IN MINNEAPOLIS'];

export default function HeroSection() {
  const headlineCtrl = useAnimation();
  const subCtrl = useAnimation();
  const ctaCtrl = useAnimation();
  const statsCtrl = useAnimation();
  const imageCtrl = useAnimation();

  useEffect(() => {
    async function sequence() {
      await imageCtrl.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
      });
      await headlineCtrl.start('visible');
      await subCtrl.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      });
      await ctaCtrl.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      });
      await statsCtrl.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
      });
    }
    sequence();
  }, [headlineCtrl, subCtrl, ctaCtrl, statsCtrl, imageCtrl]);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden flex items-center">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 40%, #0F1D32, #0A1628)',
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 60% 50%, rgba(230,57,70,0.3) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-40">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            {/* Headline */}
            <div className="space-y-1 mb-6">
              {headlineLines.map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.h1
                    variants={clipReveal}
                    initial="hidden"
                    animate={headlineCtrl}
                    transition={{ delay: i * 0.1 }}
                    className="text-display-xl text-white font-display"
                  >
                    {line}
                  </motion.h1>
                </div>
              ))}
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={subCtrl}
              className="text-body-l text-[#CBD5E1] max-w-[560px] mb-8"
            >
              Third-party furniture delivery and removal for Ashley Furniture and retailers across the Twin Cities. Professional, insured, and on time.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ctaCtrl}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/booking" className="btn-primary text-label">
                BOOK A DELIVERY
              </Link>
              <a href="tel:+17633253960" className="btn-secondary text-label justify-center">
                <Phone size={18} />
                (763) 325-3960
              </a>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={imageCtrl}
            className="order-1 lg:order-2 relative hidden md:block"
          >
            <motion.img
              src="/assets/hero-logistics-scene.png"
              alt="Xpressmen delivery trucks and furniture"
              className="w-full max-w-[600px] mx-auto object-contain"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={statsCtrl}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%] z-20 w-[calc(100%-2rem)] max-w-[900px]"
      >
        <div className="card-dark flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-0 py-6 px-8">
          {[
            { number: '500+', label: 'Deliveries Monthly' },
            { number: '4.9', label: 'Customer Rating' },
            { number: '15+', label: 'Years Experience' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-mono text-heading-m text-[#E63946] block">{stat.number}</span>
              <span className="font-display text-body-s text-[#CBD5E1] tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
