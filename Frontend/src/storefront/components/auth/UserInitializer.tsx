import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signIn } from '../../store/userSlice';
import { getCurrentUser } from '../../lib/authApi';

const UserInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize user from localStorage on app start
    const initializeUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          // Dispatch signIn action to restore user state
          dispatch(signIn({
            email: userData.email,
            name: userData.first_name || userData.username,
            username: userData.username
          }));
        }
      } catch (error) {
        // Silently handle missing token - this is expected when user is not logged in
        console.log('User not authenticated:', error.message);
      }
    };

    initializeUser();
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default UserInitializer;
