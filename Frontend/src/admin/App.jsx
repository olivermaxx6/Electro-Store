import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/system/ErrorBoundary';
import { useAuth } from './store/authStore';
import SignIn from './pages/admin/SignIn';
import SignOut from './pages/admin/SignOut';

function App() {
  const { init } = useAuth();
  
  useEffect(() => {
    // Initialize auth store
    init();
  }, [init]);


  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Sign-in and sign-out routes without AdminLayout */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/admin/sign-out" element={<SignOut />} />
          
          {/* All other admin routes with AdminLayout */}
          <Route path="/*" element={<AdminLayout><AdminRoutes /></AdminLayout>} />
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
