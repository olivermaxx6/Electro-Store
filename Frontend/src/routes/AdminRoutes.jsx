import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../admin/store/authStore';

import Dashboard from '../admin/pages/admin/Dashboard';
import ProductsPage from '../admin/pages/admin/ProductsPage';
import ManageCategoriesPage from '../admin/pages/admin/ManageCategoriesPage';
import ServicesPage from '../admin/pages/admin/ServicesPage';
import InquiriesPage from '../admin/pages/admin/InquiriesPage';
import OrdersPage from '../admin/pages/admin/OrdersPage';
import UsersPage from '../admin/pages/admin/UsersPage';
import ContentPage from '../admin/pages/admin/ContentPage';
import ReviewsPage from '../admin/pages/admin/ReviewsPage';
import ServiceReviewsPage from '../admin/pages/admin/ServiceReviewsPage';
import SettingsPage from '../admin/pages/admin/SettingsPage';
import AdminProfilePage from '../admin/pages/admin/AdminProfilePage';
import ChatPage from '../admin/pages/admin/ChatPage';
import ContactPage from '../admin/pages/admin/ContactPage';
import StorePage from '../pages/store/StorePage';

function Private({ children }){
  const { token, user, isAuthed } = useAuth();
  const location = useLocation();

  // Debug authentication state
  console.log('[AUTH] Private component - token:', !!token, 'user:', user, 'isAuthed:', isAuthed());
  
  // More robust auth check - handle cases where user might not have is_staff property
  const isAuthenticated = isAuthed() && user;
  
  console.log('[AUTH] isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    // Only redirect if we're not already on sign-in page
    if (location.pathname !== '/admin/sign-in') {
      console.log('[AUTH] Redirecting to sign-in from:', location.pathname);
      return <Navigate to="/admin/sign-in" replace state={{ from: location }} />;
    }
  }
  return children;
}

function Smoke(){ return <div style={{padding:16}}>🔧 Router OK — {new Date().toLocaleTimeString()}</div> }

export default function AdminRoutes(){
  return (
    <Routes>
      <Route path="smoke" element={<Smoke/>} />

      <Route path="dashboard" element={<Private><Dashboard/></Private>} />
      <Route path="manage-categories" element={<Private><ManageCategoriesPage/></Private>} />
      <Route path="products" element={<Private><ProductsPage/></Private>} />
      <Route path="services" element={<Private><ServicesPage/></Private>} />
      <Route path="inquiries" element={<Private><InquiriesPage/></Private>} />
      <Route path="orders" element={<Private><OrdersPage/></Private>} />
      <Route path="users" element={<Private><UsersPage/></Private>} />
      <Route path="content" element={<Private><ContentPage/></Private>} />
      <Route path="reviews" element={<Private><ReviewsPage/></Private>} />
      <Route path="service-reviews" element={<Private><ServiceReviewsPage/></Private>} />
      <Route path="settings" element={<Private><SettingsPage/></Private>} />
      <Route path="profile" element={<Private><AdminProfilePage/></Private>} />
      <Route path="chat" element={<Private><ChatPage/></Private>} />
      <Route path="contact" element={<Private><ContactPage/></Private>} />

      <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
