import { useAuth } from '../../store/authStore';
import SidebarRail from './SidebarRail';
import SidebarItem from './SidebarItem';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={`${collapsed ? 'w-[72px]' : 'w-72'} h-full bg-white/80 backdrop-blur border-r transition-all duration-300`}>
      {/* Menu Button Header - Same height as TopBar */}
      <div className="h-[85px] flex items-center justify-center border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="group relative rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
          title="Toggle Menu"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm">☰</span>
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                Menu
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="h-[calc(100%-85px)] overflow-y-auto no-scrollbar py-3">

        {/* Admin Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200/50 mb-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Admin Options</h2>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
          )}
        </div>

        <SidebarRail collapsed={collapsed} />
        
        {/* Admin Profile at bottom */}
        <div className={`mt-auto pt-4 border-t border-slate-200/50 ${collapsed ? 'flex justify-center' : 'px-4'}`}>
          <div className={collapsed ? '' : 'flex flex-col items-center'}>
            <SidebarItem
              icon={User}
              active={false}
              onClick={() => navigate('/admin/profile')}
              title={`${user?.username || 'Admin User'} - Administrator`}
              collapsed={collapsed}
              label={collapsed ? '' : `${user?.username || 'Admin User'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
