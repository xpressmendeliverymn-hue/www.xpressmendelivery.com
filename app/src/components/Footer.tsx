import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const disclaimer = `Prices are subject to change based on certain challenges and/or difficult obstacles upon delivery. Also, any rearranging of furniture or removals will affect billing. Customers are encouraged to inspect their merchandise before Xpressmen has left the clients' homes. If manufacturer damages are discovered after Xpressmen has left, you (the client) are responsible for transportation costs related to repairs or exchanges. Xpressmen is not responsible for any damaged or missing pieces that were caused by the manufacturer and/or Ashley Furniture Store. Xpressmen also reserves the right to refuse any deliveries that may cause damage to the furniture or the client's home. Once your Xpressmen Delivery Specialist shows up to the client's home with the furniture, Xpressmen will receive at least the minimum delivery and/or removal charges up to the quoted delivery and/or removal fee for transportation and restocking costs. Xpressmen will make one service call on any defective or damaged merchandise. Xpressmen delivery specialists cannot make promises not included in this disclaimer. If a client does not agree with this disclaimer please respond by email before delivery. THIS NOTICE IS IN COMPLIANCE WITH AND SUBJECT TO UCC 1-202 AND MINNESOTA STATUTE 336.1-202.`;

  return (
    <footer className="bg-[#0A1628]">
      {/* Disclaimer Bar */}
      <div className="bg-[#162540] border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-body-s text-[#64748B] leading-relaxed">{disclaimer}</p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Logo */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-display text-3xl tracking-wider">
                <span className="text-[#E63946]">X</span>
                <span className="text-white">M</span>
                <span className="text-[#E63946]">X</span>
              </span>
            </Link>
            <p className="font-display text-label text-[#CBD5E1]">Your Service Best Men</p>
            <p className="text-body-s text-[#64748B] mt-3">
              Professional furniture delivery and removal services across the Minneapolis area.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-display text-label text-white mb-4">Services</h4>
            <ul className="space-y-2">
              {['Delivery', 'Removal', 'Assembly', 'White Glove'].map((s) => (
                <li key={s}>
                  <a href={`/#services`} className="text-body-m text-[#CBD5E1] hover:text-white transition-colors duration-300">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="font-display text-label text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Service Areas', 'Contact'].map((c) => (
                <li key={c}>
                  <a href="#" className="text-body-m text-[#CBD5E1] hover:text-white transition-colors duration-300">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="font-display text-label text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+17633253960" className="flex items-center gap-2 text-body-m text-[#E63946] hover:text-[#C1121F] transition-colors">
                  <Phone size={16} />
                  (763) 325-3960
                </a>
              </li>
              <li className="flex items-center gap-2 text-body-m text-[#CBD5E1]">
                <Mail size={16} />
                info@xpressmen.com
              </li>
              <li className="flex items-start gap-2 text-body-m text-[#CBD5E1]">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                Minneapolis, MN — Serving the Twin Cities
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-s text-[#64748B]">
            &copy; {new Date().getFullYear()} Xpressmen Logistics Services. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#CBD5E1] hover:text-[#E63946] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-[#CBD5E1] hover:text-[#E63946] transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
