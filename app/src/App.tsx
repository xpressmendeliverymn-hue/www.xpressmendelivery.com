import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import Home from '@/pages/Home';
import Booking from '@/pages/Booking';
import TrackOrder from '@/pages/TrackOrder';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminOrders from '@/pages/AdminOrders';
import AdminSchedule from '@/pages/AdminSchedule';
import AdminSalespeople from '@/pages/AdminSalespeople';
import AdminInvites from '@/pages/AdminInvites';
import AdminWarehouse from '@/pages/AdminWarehouse';
import SalespersonPortal from '@/pages/SalespersonPortal';
import SalespersonUpload from '@/pages/SalespersonUpload';
import SalespersonSignup from '@/pages/SalespersonSignup';
import SalespersonBook from '@/pages/SalespersonBook';
import PageTransition from '@/components/PageTransition';
import { useAuthStore } from '@/store/authStore';
import { Toaster } from 'sonner';

function App() {
  const location = useLocation();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
                <Footer />
              </PageTransition>
            }
          />
          <Route
            path="/booking"
            element={
              <PageTransition>
                <Booking />
                <Footer />
              </PageTransition>
            }
          />
          <Route
            path="/track/:reference?"
            element={
              <PageTransition>
                <TrackOrder />
                <Footer />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
                <Footer />
              </PageTransition>
            }
          />
          <Route
            path="/admin"
            element={
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PageTransition>
                <AdminOrders />
              </PageTransition>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <PageTransition>
                <AdminSchedule />
              </PageTransition>
            }
          />
          <Route
            path="/admin/salespeople"
            element={
              <PageTransition>
                <AdminSalespeople />
              </PageTransition>
            }
          />
          <Route
            path="/signup/:token"
            element={
              <PageTransition>
                <SalespersonSignup />
              </PageTransition>
            }
          />
          <Route
            path="/salesperson"
            element={
              <PageTransition>
                <SalespersonPortal />
              </PageTransition>
            }
          />
          <Route
            path="/salesperson/book"
            element={
              <PageTransition>
                <SalespersonBook />
              </PageTransition>
            }
          />
          <Route
            path="/salesperson/upload/:orderId"
            element={
              <PageTransition>
                <SalespersonUpload />
              </PageTransition>
            }
          />
          <Route
            path="/admin/invites"
            element={
              <PageTransition>
                <AdminInvites />
              </PageTransition>
            }
          />
          <Route
            path="/admin/warehouse"
            element={
              <PageTransition>
                <AdminWarehouse />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1D32',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <BackToTop />
    </div>
  );
}

export default App;
