import ThemeToggle from '../ThemeToggle';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../store/authStore';

export default function TopBar({ collapsed, title = 'Dashboard' }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('TopBar - Auth store user:', user);
  }, [user]);

  return (
    <>
      <header className={`fixed top-0 z-40 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg transition-all duration-300 ${collapsed ? 'left-[72px] right-0' : 'left-72 right-0'}`}>
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 py-4">

          {/* Center Section - Page Title */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </div>

          {/* Right Section - Actions with 20px margin from end */}
          <div className="flex items-center gap-3 mr-5">
            {/* Theme Toggle */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-1 hover:border-amber-300 dark:hover:border-amber-500 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all duration-300 hover:shadow-md">
              <ThemeToggle />
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="group relative rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 hover:border-red-300 dark:hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
              title={`Logout${user?.username ? ` (${user.username})` : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <LogOut size={14} className="text-white"/>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                  Logout
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
