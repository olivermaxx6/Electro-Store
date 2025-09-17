import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoutes from '@shared/routes/AdminRoutes';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/system/ErrorBoundary';
import { useAuth } from './store/authStore';
import SignIn from './pages/admin/SignIn';

function App() {
  const { init } = useAuth();
  
  useEffect(() => {
    // Initialize auth store
    init();
  }, [init]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Sign-in route without AdminLayout */}
          <Route path="/admin/sign-in" element={<SignIn />} />
          
          {/* All other admin routes with AdminLayout */}
          <Route path="/admin/*" element={<AdminLayout><AdminRoutes /></AdminLayout>} />
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
