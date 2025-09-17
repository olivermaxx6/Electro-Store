import { useState, useEffect } from 'react';
import { ThemeCard, ThemeInput, ThemeButton, ThemeAlert } from '@shared/theme';
import { User, Mail, Phone, MapPin, Shield, Save, Camera, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../store/authStore';

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: null
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate password fields if any are filled
      if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required to change password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long');
        }
      }
      
      // Prepare update data
      const updateData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      // Add password fields if provided
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Call the actual updateProfile function
      if (updateProfile) {
        await updateProfile(updateData);
      }
      
      setAlert({
        show: true,
        message: 'Profile updated successfully!',
        type: 'success'
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Alert */}
        {alert.show && (
          <ThemeAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(prev => ({ ...prev, show: false }))}
          />
        )}

        {/* Profile Overview */}
        <ThemeCard>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {user?.username || 'Admin User'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Administrator
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield size={16} className="text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    Admin Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Personal Information */}
        <ThemeCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Personal Information
              </h3>
            </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemeInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                icon={<User size={18} />}
                required
              />
              <ThemeInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                icon={<Mail size={18} />}
                required
              />
              <ThemeInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                icon={<Phone size={18} />}
              />
              <ThemeInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                icon={<MapPin size={18} />}
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-amber-500" />
                Change Password
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ThemeInput
                  label="Current Password"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  icon={<Shield size={18} />}
                />
                <ThemeInput
                  label="New Password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  icon={<Shield size={18} />}
                />
                <ThemeInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  icon={<Shield size={18} />}
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPassword ? 'Hide' : 'Show'} Passwords
              </button>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
              <ThemeButton
                type="submit"
                variant="primary"
                icon={<Save size={18} />}
                loading={loading}
                className="whitespace-nowrap min-w-fit flex-shrink-0"
              >
                Save Changes
              </ThemeButton>
            </div>
          </form>
          </div>
        </ThemeCard>

        {/* Account Security */}
        <ThemeCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-red-500" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <ThemeButton variant="primary">
                  Enable
                </ThemeButton>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">
                    Login Sessions
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage your active login sessions
                  </p>
                </div>
                <ThemeButton variant="primary">
                  View Sessions
                </ThemeButton>
              </div>
            </div>
          </div>
        </ThemeCard>
      </div>
  );
}
