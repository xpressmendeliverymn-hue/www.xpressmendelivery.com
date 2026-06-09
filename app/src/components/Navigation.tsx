import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Truck, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const publicLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Areas', href: '/#areas' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchCount = useNotificationStore((s) => s.fetchCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setShowNotifs(false);
  }, [location]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && isHome) {
      e.preventDefault();
      const id = href.replace('/#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setIsMobileOpen(false);
    }
  };

  const handleNotifClick = () => {
    if (!showNotifs) fetchNotifications();
    setShowNotifs(!showNotifs);
  };

  const roleLinks = [] as { label: string; href: string }[];
  if (user?.role === 'admin') {
    roleLinks.push({ label: 'Admin', href: '/admin' });
  }
  if (user?.role === 'salesperson') {
    roleLinks.push({ label: 'Portal', href: '/salesperson' });
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0A1628]/85 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display text-2xl tracking-wider">
                <span className="text-[#E63946]">X</span>
                <span className="text-white">M</span>
                <span className="text-[#E63946]">X</span>
              </span>
              <span className="font-display text-lg text-white hidden sm:block tracking-wider">
                XPRESSMEN
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {isHome && publicLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="font-display text-label text-white hover:text-[#E63946] transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E63946] group-hover:w-full transition-all duration-300 origin-left" />
                </a>
              ))}
              <Link
                to="/track"
                className="font-display text-label text-white hover:text-[#E63946] transition-colors duration-300 flex items-center gap-1"
              >
                <Truck size={14} />
                Track
              </Link>

              {roleLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-display text-label text-[#E63946] hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={handleNotifClick}
                    className="relative p-2 text-white hover:text-[#E63946] transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-[#E63946] text-white text-[10px] rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-[#0F1D32] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="flex items-center justify-between p-3 border-b border-white/10">
                          <span className="font-display text-white text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-[#E63946] hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 && (
                            <div className="p-4 text-center text-sm text-[#64748B]">No notifications</div>
                          )}
                          {notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => markRead(n.id)}
                              className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                                !n.read ? 'bg-[#E63946]/5' : ''
                              }`}
                            >
                              <p className="text-sm text-white font-medium">{n.title}</p>
                              <p className="text-xs text-[#64748B] mt-0.5">{n.message}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <User size={16} className="text-[#E63946]" />
                    <span className="hidden lg:inline">{user?.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-[#64748B] hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="font-display text-label text-white hover:text-[#E63946] transition-colors">
                  Login
                </Link>
              )}

              <Link to="/booking" className="btn-primary text-sm py-2.5 px-5">
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-[#0A1628] md:hidden"
          >
            <div className="flex flex-col h-full p-6 pt-20">
              <button
                className="absolute top-4 right-4 text-white p-2"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={28} />
              </button>

              {isHome && publicLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-heading-s text-white py-4 border-b border-white/10 hover:text-[#E63946] transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Link to="/track" className="font-display text-heading-s text-white py-4 border-b border-white/10 hover:text-[#E63946] transition-colors block">
                  Track Order
                </Link>
              </motion.div>

              {roleLinks.map((link, i) => (
                <motion.div key={link.label} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
                  <Link to={link.href} className="font-display text-heading-s text-[#E63946] py-4 border-b border-white/10 block">
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {isAuthenticated && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4">
                  <p className="text-white text-sm mb-2">{user?.name} ({user?.role})</p>
                  <button onClick={logout} className="text-[#E63946] text-sm">Logout</button>
                </motion.div>
              )}

              {!isAuthenticated && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4">
                  <Link to="/login" className="font-display text-heading-s text-white py-4 border-b border-white/10 block">
                    Login
                  </Link>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-8"
              >
                <Link
                  to="/booking"
                  className="btn-primary w-full justify-center text-lg"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Book Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
