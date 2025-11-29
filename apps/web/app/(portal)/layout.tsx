'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Home, FileText, MessageSquare, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, isClient, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && !isClient) {
      // Redirect agents to dashboard
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, isClient, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isClient) {
    return null;
  }

  const navigation = [
    { name: 'Overview', href: '/portal', icon: Home },
    { name: 'My Transaction', href: '/portal/transaction', icon: FileText },
    { name: 'Messages', href: '/portal/messages', icon: MessageSquare },
    { name: 'Profile', href: '/portal/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/portal') {
      return pathname === '/portal';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/portal" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary-500" />
              <span className="font-bold text-xl text-primary-500">DealFlow</span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                Welcome, {user?.firstName}
              </span>
              <button
                onClick={logout}
                className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-neutral-500 text-center">
            Need help? Contact your agent or email support@dealflow.ai
          </p>
        </div>
      </footer>
    </div>
  );
}
