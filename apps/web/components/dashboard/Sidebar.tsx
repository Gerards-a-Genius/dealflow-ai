'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Brain,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Transactions', href: '/dashboard/transactions', icon: FileText },
  { name: 'Showings', href: '/dashboard/showings', icon: Calendar },
  { name: 'AI Tools', href: '/dashboard/ai', icon: Brain },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary-500 text-white transition-all duration-300 z-40 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-primary-400">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Building2 className="h-8 w-8 flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg">DealFlow AI</span>}
        </Link>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-primary-400 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-primary-200 hover:bg-white/5 hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-secondary-400' : ''}`} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-primary-400">
        {bottomNavigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-primary-200 hover:bg-white/5 hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-secondary-400' : ''}`} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
