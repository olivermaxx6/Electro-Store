import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';

import Dashboard from '../pages/admin/Dashboard';
import ProductsPage from '../pages/admin/ProductsPage';
import ManageCategoriesPage from '../pages/admin/ManageCategoriesPage';
import ServicesPage from '../pages/admin/ServicesPage';
import OrdersPage from '../pages/admin/OrdersPage';
import UsersPage from '../pages/admin/UsersPage';
import ContentPage from '../pages/admin/ContentPage';
import ReviewsPage from '../pages/admin/ReviewsPage';
import ServiceReviewsPage from '../pages/admin/ServiceReviewsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import ChatPage from '../pages/admin/ChatPage';
import ContactPage from '../pages/admin/ContactPage';
import InquiriesPage from '../pages/admin/InquiriesPage';
import Welcome from '../pages/admin/Welcome';

function Smoke(){ return <div style={{padding:16}}>🔧 Router OK — {new Date().toLocaleTimeString()}</div> }

export default function AdminRoutes(){
  return (
    <Routes>
      <Route path="smoke" element={<Smoke/>} />

      {/* Protected routes with AuthGuard */}
      <Route path="dashboard" element={<AuthGuard><Dashboard/></AuthGuard>} />
      <Route path="manage-categories" element={<AuthGuard><ManageCategoriesPage/></AuthGuard>} />
      <Route path="products" element={<AuthGuard><ProductsPage/></AuthGuard>} />
      <Route path="services" element={<AuthGuard><ServicesPage/></AuthGuard>} />
      <Route path="orders" element={<AuthGuard><OrdersPage/></AuthGuard>} />
      <Route path="users" element={<AuthGuard><UsersPage/></AuthGuard>} />
      <Route path="content" element={<AuthGuard><ContentPage/></AuthGuard>} />
      <Route path="reviews" element={<AuthGuard><ReviewsPage/></AuthGuard>} />
      <Route path="service-reviews" element={<AuthGuard><ServiceReviewsPage/></AuthGuard>} />
      <Route path="settings" element={<AuthGuard><SettingsPage/></AuthGuard>} />
      <Route path="profile" element={<AuthGuard><AdminProfilePage/></AuthGuard>} />
      <Route path="chat" element={<AuthGuard><ChatPage/></AuthGuard>} />
      <Route path="contact" element={<AuthGuard><ContactPage/></AuthGuard>} />
      <Route path="inquiries" element={<AuthGuard><InquiriesPage/></AuthGuard>} />
      <Route path="welcome" element={<AuthGuard><Welcome/></AuthGuard>} />

      <Route path="" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
