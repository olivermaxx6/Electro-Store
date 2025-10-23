import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/header/TopBar';
import MainHeader from '../components/header/MainHeader';
import NavBar from '../components/header/NavBar';
import FooterColumns from '../components/footer/FooterColumns';
import BottomBar from '../components/footer/BottomBar';
import StoreSettingsInitializer from '../components/common/StoreSettingsInitializer';
import TitleUpdater from '../components/common/TitleUpdater';
import ScrollToTop from '../components/common/ScrollToTop';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Scroll to top on route change */}
      <ScrollToTop />
      
      {/* Initialize store settings and update title */}
      <StoreSettingsInitializer />
      <TitleUpdater />
      
      {/* Top Utility Bar */}
      <TopBar />
      
      {/* Main Header */}
      <MainHeader />
      
      {/* Navigation Bar */}
      <NavBar />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="w-full">
        <FooterColumns />
        <BottomBar />
      </footer>
      
    </div>
  );
};

export default Layout;