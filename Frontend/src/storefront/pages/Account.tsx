import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectIsAuthenticated } from '../store/userSlice';
import { signIn, signOut } from '../store/userSlice';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import TitleUpdater from '../components/common/TitleUpdater';

const Account: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate privacy consent for sign up
    if (!isSignIn && !privacyConsent) {
      alert('Please agree to the Privacy Policy to create an account.');
      return;
    }
    
    if (isSignIn) {
      // Mock sign in
      dispatch(signIn({ email: formData.email, name: formData.name }));
    } else {
      // Mock sign up
      dispatch(signIn({ email: formData.email, name: formData.name }));
    }
  };
  
  const handleSignOut = () => {
    dispatch(signOut());
    navigate('/');
  };
  
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TitleUpdater pageTitle="My Account" />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={currentUser?.name || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors">
                    Update Information
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
                <div className="text-center py-8">
                  <Placeholder size="md" className="mx-auto mb-4">
                    <div className="text-gray-400">No orders yet</div>
                  </Placeholder>
                  <p className="text-gray-600">You haven't placed any orders yet.</p>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Menu</h3>
                <nav className="space-y-2">
                  <a href="#" className="block py-2 text-gray-600 hover:text-primary transition-colors">
                    Order History
                  </a>
                  <a href="#" className="block py-2 text-gray-600 hover:text-primary transition-colors">
                    Wishlist
                  </a>
                  <a href="#" className="block py-2 text-gray-600 hover:text-primary transition-colors">
                    Address Book
                  </a>
                  <a href="#" className="block py-2 text-gray-600 hover:text-primary transition-colors">
                    Payment Methods
                  </a>
                </nav>
              </div>
              
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TitleUpdater pageTitle="Sign In" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignIn ? 'Sign In' : 'Create Account'}
              </h1>
              <p className="text-gray-600">
                {isSignIn 
                  ? 'Sign in to your account to continue' 
                  : 'Create a new account to get started'
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isSignIn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required={!isSignIn}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              {!isSignIn && (
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacyConsent"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    required={!isSignIn}
                  />
                  <label htmlFor="privacyConsent" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a 
                      href="/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                    {' '}and consent to the processing of my personal information as described therein.
                  </label>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-600 transition-colors"
              >
                {isSignIn ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-primary hover:text-primary-600 transition-colors"
              >
                {isSignIn 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;