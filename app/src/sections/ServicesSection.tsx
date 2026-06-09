import { useState } from 'react';
import { Truck, Sofa, ShieldCheck } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

const services = [
  {
    icon: Truck,
    title: 'FURNITURE DELIVERY',
    description: 'Professional delivery from Ashley Furniture and other retailers directly to your home. We handle the heavy lifting, stairs, and tight corners.',
    image: '/assets/delivery-thumb.jpg',
  },
  {
    icon: Sofa,
    title: 'FURNITURE REMOVAL',
    description: 'Getting new furniture? We\'ll remove and responsibly dispose of your old pieces. One trip, both jobs done.',
    image: '/assets/removal-thumb.jpg',
  },
  {
    icon: ShieldCheck,
    title: 'WHITE GLOVE SERVICE',
    description: 'Premium in-home placement. We unwrap, assemble, place in your chosen room, and remove all packaging debris.',
    image: '/assets/white-glove-thumb.jpg',
  },
];

export default function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="services" className="section-dark relative" style={{ paddingTop: '120px' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <ScrollReveal className="text-center mb-12">
          <span className="text-label text-[#E63946] tracking-widest">OUR SERVICES</span>
          <h2 className="text-heading-m text-white mt-2">FURNITURE LOGISTICS MADE SIMPLE</h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <StaggerItem key={service.title}>
              <div
                className="card-dark relative overflow-hidden group cursor-default"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <service.icon size={48} className="text-[#E63946] mb-4" strokeWidth={1.5} />
                <h3 className="text-heading-s text-white mb-3">{service.title}</h3>
                <p className="text-body-m text-[#CBD5E1]">{service.description}</p>

                {/* Hover reveal image */}
                <div
                  className={`mt-4 rounded-xl overflow-hidden transition-all duration-300 ${
                    hoveredIndex === i ? 'opacity-100 max-h-[200px]' : 'opacity-0 max-h-0'
                  }`}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-[200px] object-cover"
                  />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
