import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { HomePage } from './pages/HomePage';
const MenuPage = React.lazy(() => import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const CustomCakePage = React.lazy(() => import('./pages/CustomCakePage').then((m) => ({ default: m.CustomCakePage })));
const AboutLocationPage = React.lazy(() => import('./pages/AboutLocationPage').then((m) => ({ default: m.AboutLocationPage })));
const ContactOrderPage = React.lazy(() => import('./pages/ContactOrderPage').then((m) => ({ default: m.ContactOrderPage })));
const ReviewsGalleryPage = React.lazy(() => import('./pages/ReviewsGalleryPage').then((m) => ({ default: m.ReviewsGalleryPage })));
const CustomerAccountPage = React.lazy(() => import('./pages/CustomerAccountPage').then((m) => ({ default: m.CustomerAccountPage })));
const CustomerAuthPages = React.lazy(() => import('./pages/CustomerAuthPages').then((m) => ({ default: m.CustomerAuthPages })));
import { Footer } from './components/Footer';
import { QuickOrderModal } from './components/QuickOrderModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { SiteHead } from './components/SiteHead';
import { CookieNotice } from './components/CookieNotice';
const LegalPage = React.lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.LegalPage })));
const NotFoundPage = React.lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.NotFoundPage })));
import { flushPendingOrders } from './data/store';

const AdminApp = React.lazy(() => import('./admin/AdminApp'));

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.hash.startsWith('#/admin');
  });

  const validPages: PageId[] = [
    'home',
    'menu',
    'custom-cakes',
    'about',
    'contact',
    'reviews',
    'account',
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'privacy',
    'terms',
  ];

  const [notFound, setNotFound] = useState(false);

  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const rawHash = window.location.hash.replace('#', '');
    if (rawHash.includes('type=recovery')) {
      return 'reset-password';
    }
    const cleanHash = rawHash.split('?')[0].replace(/^\//, '') as PageId;
    return validPages.includes(cleanHash) ? cleanHash : 'home';
  });

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<string | undefined>(undefined);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Sync hash with current page and admin route
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#/admin')) {
        setIsAdminRoute(true);
        return;
      }
      setIsAdminRoute(false);

      const rawHash = window.location.hash.replace('#', '');
      if (rawHash.includes('type=recovery')) {
        setCurrentPage('reset-password');
        return;
      }
      const cleanHash = rawHash.split('?')[0].replace(/^\//, '') as PageId;
      if (validPages.includes(cleanHash)) {
        setNotFound(false);
        setCurrentPage(cleanHash);
      } else if (cleanHash === ('' as PageId)) {
        setNotFound(false);
        setCurrentPage('home');
      } else {
        setNotFound(true);
      }
    };

    flushPendingOrders().catch(() => undefined);
    const onOnline = () => flushPendingOrders().catch(() => undefined);
    window.addEventListener('online', onOnline);

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  if (isAdminRoute) {
    return (
      <React.Suspense fallback={<div style={{ padding: '32px', fontFamily: 'sans-serif' }}>Loading Zion Admin...</div>}>
        <AdminApp />
      </React.Suspense>
    );
  }

  const handleNavigate = (page: PageId) => {
    setNotFound(false);
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOrderModal = (itemName?: string) => {
    setSelectedOrderItem(itemName);
    setOrderModalOpen(true);
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <CustomerAuthProvider>
      <div className="min-h-screen flex flex-col" id="app-root-container">
        {/* RENDER CURRENT VIEW */}
        <SiteHead page={notFound ? 'not-found' : currentPage} />
        <main className="flex-1" id="main-page-content">
          <React.Suspense fallback={<div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>}>
          {notFound && (
            <NotFoundPage onNavigate={handleNavigate} onOpenOrderModal={() => handleOpenOrderModal()} />
          )}
          {!notFound && (currentPage === 'privacy' || currentPage === 'terms') && (
            <LegalPage kind={currentPage} onNavigate={handleNavigate} onOpenOrderModal={() => handleOpenOrderModal()} />
          )}
          {!notFound && currentPage === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
            />
          )}
          {!notFound && currentPage === 'menu' && (
            <MenuPage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
            />
          )}
          {!notFound && currentPage === 'custom-cakes' && (
            <CustomCakePage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
            />
          )}
          {!notFound && currentPage === 'about' && (
            <AboutLocationPage
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          {!notFound && currentPage === 'contact' && (
            <ContactOrderPage
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          {!notFound && currentPage === 'reviews' && (
            <ReviewsGalleryPage
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          {!notFound && currentPage === 'account' && (
            <CustomerAccountPage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
              onOpenAuthModal={handleOpenAuthModal}
            />
          )}
          {!notFound && (currentPage === 'login' ||
            currentPage === 'register' ||
            currentPage === 'forgot-password' ||
            currentPage === 'reset-password') && (
            <CustomerAuthPages
              mode={currentPage}
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          </React.Suspense>
        </main>

        {/* SHARED FOOTER ACROSS ALL PAGES */}
        <Footer onNavigate={handleNavigate} />

        {/* STICKY MOBILE BOTTOM NAVIGATION BAR & REACHABLE ORDER BUTTON */}
        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenOrderModal={() => handleOpenOrderModal()}
        />

        {/* QUICK ORDER MODAL */}
        <QuickOrderModal
          isOpen={orderModalOpen}
          onClose={() => {
            setOrderModalOpen(false);
            setSelectedOrderItem(undefined);
          }}
          onNavigate={handleNavigate}
          initialItemName={selectedOrderItem}
          onOpenAuthModal={handleOpenAuthModal}
        />

        <CookieNotice onNavigate={handleNavigate} />

        {/* CUSTOMER AUTH MODAL */}
        <CustomerAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onNavigate={handleNavigate}
        />
      </div>
    </CustomerAuthProvider>
  );
}
