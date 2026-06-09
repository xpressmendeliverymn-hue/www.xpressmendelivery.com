import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Xpressmen made our Ashley furniture delivery so easy. They navigated our narrow staircase without a scratch and placed everything exactly where we wanted. Highly recommend!",
    author: 'Sarah M.',
    location: 'Minneapolis',
  },
  {
    quote: "We needed old furniture removed and a new dining set delivered same day. Xpressmen handled both in under 2 hours. Professional crew, fair pricing.",
    author: 'James T.',
    location: 'St. Louis Park',
  },
  {
    quote: "The booking system asked all the right questions. I uploaded photos of my sectional, they knew exactly what to bring. White glove service was worth every penny.",
    author: 'Lisa K.',
    location: 'Bloomington',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section-dark">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <ScrollReveal className="text-center mb-12">
          <span className="text-label text-[#E63946] tracking-widest">HAPPY CUSTOMERS</span>
          <h2 className="text-heading-m text-white mt-2">WHAT OUR CLIENTS SAY</h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.author}>
              <div className="card-dark h-full flex flex-col">
                <Quote size={36} className="text-[#E63946] mb-3" />
                <p className="text-body-m text-[#CBD5E1] italic flex-1 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-body-s text-white font-semibold">
                    {t.author} — {t.location}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-[#10B981] fill-[#10B981]" />
                    ))}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
