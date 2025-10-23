import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Wrench, MessagesSquare, ShoppingCart, Users, FileText, Star, Settings, MessageCircle, Mail } from 'lucide-react';
import SidebarItem from './SidebarItem';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manage-categories', label: 'Manage Categories', icon: Package },
  { to: '/products', label: 'Product Management', icon: Package },
  { to: '/services', label: 'Services Management', icon: Wrench },
  { to: '/orders', label: 'Order Management', icon: ShoppingCart },
  { to: '/users', label: 'User Management', icon: Users },
  { to: '/content', label: 'Website Content', icon: FileText },
  { to: '/reviews', label: 'Product Reviews', icon: Star },
  { to: '/service-reviews', label: 'Service Reviews', icon: Star },
  { to: '/chat', label: 'Customer Chat', icon: MessageCircle },
  { to: '/contact', label: 'Contact Messages', icon: Mail },
  { to: '/settings', label: 'Store Settings', icon: Settings },
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
