import HeroSection from '@/sections/HeroSection';
import ServicesSection from '@/sections/ServicesSection';
import HowItWorksSection from '@/sections/HowItWorksSection';
import InteractivePreviewSection from '@/sections/InteractivePreviewSection';
import TestimonialsSection from '@/sections/TestimonialsSection';
import ServiceAreasSection from '@/sections/ServiceAreasSection';
import FAQSection from '@/sections/FAQSection';
import CTABannerSection from '@/sections/CTABannerSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <InteractivePreviewSection />
      <TestimonialsSection />
      <ServiceAreasSection />
      <FAQSection />
      <CTABannerSection />
    </>
  );
}
