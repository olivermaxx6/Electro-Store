import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/header/TopBar';
import MainHeader from '../components/header/MainHeader';
import NavBar from '../components/header/NavBar';
import FooterColumns from '../components/footer/FooterColumns';
import BottomBar from '../components/footer/BottomBar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
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
      <footer className="bg-gray-50 dark:bg-slate-800">
        <FooterColumns />
        <BottomBar />
      </footer>
    </div>
  );
};

export default Layout;