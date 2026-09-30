import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CustomCakePage } from './pages/CustomCakePage';
import { AboutLocationPage } from './pages/AboutLocationPage';
import { ContactOrderPage } from './pages/ContactOrderPage';
import { ReviewsGalleryPage } from './pages/ReviewsGalleryPage';
import { Footer } from './components/Footer';
import { QuickOrderModal } from './components/QuickOrderModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const hash = window.location.hash.replace('#', '') as PageId;
    const validPages: PageId[] = ['home', 'menu', 'custom-cakes', 'about', 'contact', 'reviews'];
    return validPages.includes(hash) ? hash : 'home';
  });

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<string | undefined>(undefined);

  // Sync hash with current page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = ['home', 'menu', 'custom-cakes', 'about', 'contact', 'reviews'];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOrderModal = (itemName?: string) => {
    setSelectedOrderItem(itemName);
    setOrderModalOpen(true);
  };

  return (
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
      />
    </div>
  );
}
