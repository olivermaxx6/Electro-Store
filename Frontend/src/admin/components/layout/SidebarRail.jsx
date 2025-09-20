import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Wrench, MessagesSquare, ShoppingCart, Users, FileText, Star, Settings, MessageCircle, Mail } from 'lucide-react';
import SidebarItem from './SidebarItem';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/manage-categories', label: 'Manage Categories', icon: Package },
  { to: '/admin/products', label: 'Product Management', icon: Package },
  { to: '/admin/services', label: 'Services Management', icon: Wrench },
  { to: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/content', label: 'Website Content', icon: FileText },
  { to: '/admin/reviews', label: 'Product Reviews', icon: Star },
  { to: '/admin/service-reviews', label: 'Service Reviews', icon: Star },
  { to: '/admin/chat', label: 'Customer Chat', icon: MessageCircle },
  { to: '/admin/contact', label: 'Contact Messages', icon: Mail },
  { to: '/admin/settings', label: 'Store Settings', icon: Settings },
];

export default function SidebarRail({ collapsed }) {
  return (
    <nav className={`flex flex-col gap-3 ${collapsed ? 'items-center' : 'items-center px-4'}`}>
      {links.map(item => (
        <NavLink key={item.label} to={item.to}>
          {({ isActive }) => (
            <SidebarItem
              icon={item.icon}
              active={isActive}
              title={item.label}
              collapsed={collapsed}
              label={item.label}
            />
          )}
        </NavLink>
      ))}
    </nav>
  );
}
