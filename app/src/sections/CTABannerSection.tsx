import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';

export default function CTABannerSection() {
  return (
    <section
      className="relative h-[400px] flex items-center justify-center overflow-hidden"
      style={{ backgroundAttachment: 'fixed' }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/truck-background.jpg)' }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,22,40,0.85)] to-[rgba(10,22,40,0.9)]" />

      {/* Content */}
      <ScrollReveal className="relative z-10 text-center px-4">
        <h2 className="text-display-l text-white">READY TO GET STARTED?</h2>
        <p className="text-body-l text-[#CBD5E1] mt-4 mb-8">
          Book your delivery or removal in under 3 minutes.
        </p>
        <Link to="/booking" className="btn-primary text-label px-12 py-4 text-lg">
          BOOK NOW
        </Link>
      </ScrollReveal>
    </section>
  );
}
