import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout({ children, title = 'Dashboard' }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar sticks to the far-left with NO margin/padding around it */}
      <aside className="sticky top-0 left-0 h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Main content scrolls; all page padding lives here */}
      <main className="flex-1 min-w-0">
        <TopBar collapsed={collapsed} title={title} />
        <div className="px-4 py-4 md:px-6 mt-[70px]">
          {children}
        </div>
      </main>
    </div>
  );
}
