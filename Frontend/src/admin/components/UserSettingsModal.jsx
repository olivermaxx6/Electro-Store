import { useEffect, useState } from 'react';
import { useAuth } from '../store/authStore';

export default function UserSettingsModal({ open, onClose }) {
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ username:'', email:'' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const { user, me, updateProfile, changePassword } = useAuth();

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          console.log('Loading admin profile...');
          console.log('Current user from auth store:', user);
          
          // If we have user data, use it directly, otherwise fetch it
          let userData = user;
          if (!userData) {
            userData = await me();
          }
          
          console.log('Profile data received:', userData);
          if (userData) {
            setProfile({ 
              username: userData.username || '', 
              email: userData.email || ''
            });
            setMsg(null); // Clear any previous error messages
          } else {
            setMsg('No user data available');
          }
        } catch (error) {
          console.error('Failed to load admin profile:', error);
          setMsg(`Failed to load profile data: ${error.message}`);
        }
      })();
    }
  }, [open, user, me]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const result = await updateProfile(profile);
      if (result.ok) {
        setMsg('Profile updated successfully');
      } else {
        setMsg(result.error?.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMsg('Failed to update profile');
    } finally { setLoading(false); }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = { 
      current_password: fd.get('current_password'), 
      new_password: fd.get('new_password'),
      confirm_password: fd.get('confirm_password')
    };
    
    // Validate password length
    if (payload.new_password.length < 8) {
      setMsg('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    // Validate password confirmation
    if (payload.new_password !== payload.confirm_password) {
      setMsg('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const result = await changePassword(payload);
      if (result.ok) {
        setMsg('Password changed successfully');
        e.currentTarget.reset();
      } else {
        setMsg(result.error?.detail || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMsg('Failed to change password');
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl border bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex gap-3">
            <button className={`text-sm ${tab==='profile'?'font-semibold':''}`} onClick={()=>{setTab('profile'); setMsg(null);}}>Profile</button>
            <button className={`text-sm ${tab==='password'?'font-semibold':''}`} onClick={()=>{setTab('password'); setMsg(null);}}>Password</button>
          </div>
          <button onClick={onClose} className="rounded-lg border px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-4">
          {tab==='profile' && (
            <form onSubmit={saveProfile} className="space-y-3">
              <div>
                <label className="text-sm">Username</label>
                <input value={profile.username} onChange={e=>setProfile(p=>({...p, username:e.target.value}))}
                       className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"/>
              </div>
              <div>
                <label className="text-sm">Email</label>
                <input value={profile.email} onChange={e=>setProfile(p=>({...p, email:e.target.value}))}
                       className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"/>
              </div>
              <div className="flex items-center gap-3">
                <button disabled={loading} className="rounded-xl border px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">{loading?'Saving...':'Save'}</button>
                {msg && <span className="text-sm opacity-80">{msg}</span>}
              </div>
            </form>
          )}
          {tab==='password' && (
            <form onSubmit={changePwd} className="space-y-3">
              <div>
                <label className="text-sm">Current password</label>
                <input required name="current_password" type="password" className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"/>
              </div>
              <div>
                <label className="text-sm">New password</label>
                <input required name="new_password" type="password" minLength="8" className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"/>
              </div>
              <div>
                <label className="text-sm">Confirm new password</label>
                <input required name="confirm_password" type="password" minLength="8" className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"/>
              </div>
              <div className="flex items-center gap-3">
                <button disabled={loading} className="rounded-xl border px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">{loading?'Updating...':'Change password'}</button>
                {msg && <span className="text-sm opacity-80">{msg}</span>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
