import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CustomCakePage } from './pages/CustomCakePage';
import { AboutLocationPage } from './pages/AboutLocationPage';
import { ContactOrderPage } from './pages/ContactOrderPage';
import { ReviewsGalleryPage } from './pages/ReviewsGalleryPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { CustomerAuthPages } from './pages/CustomerAuthPages';
import { Footer } from './components/Footer';
import { QuickOrderModal } from './components/QuickOrderModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

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
  ];

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
        setCurrentPage(cleanHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isAdminRoute) {
    return (
      <React.Suspense fallback={<div style={{ padding: '32px', fontFamily: 'sans-serif' }}>Loading Zion Admin...</div>}>
        <AdminApp />
      </React.Suspense>
    );
  }

  const handleNavigate = (page: PageId) => {
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
        <main className="flex-1" id="main-page-content">
          {currentPage === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
            />
          )}
          {currentPage === 'menu' && (
            <MenuPage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
            />
          )}
          {currentPage === 'custom-cakes' && (
            <CustomCakePage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
            />
          )}
          {currentPage === 'about' && (
            <AboutLocationPage
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          {currentPage === 'contact' && (
            <ContactOrderPage
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          {currentPage === 'reviews' && (
            <ReviewsGalleryPage
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
          {currentPage === 'account' && (
            <CustomerAccountPage
              onNavigate={handleNavigate}
              onOpenOrderModal={handleOpenOrderModal}
              onOpenAuthModal={handleOpenAuthModal}
            />
          )}
          {(currentPage === 'login' ||
            currentPage === 'register' ||
            currentPage === 'forgot-password' ||
            currentPage === 'reset-password') && (
            <CustomerAuthPages
              mode={currentPage}
              onNavigate={handleNavigate}
              onOpenOrderModal={() => handleOpenOrderModal()}
            />
          )}
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
