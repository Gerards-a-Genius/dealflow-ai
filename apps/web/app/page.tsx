'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { Building2, ArrowRight, CheckCircle, Sparkles, Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, loading, isAgent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isAgent) {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }
    }
  }, [isAuthenticated, loading, isAgent, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary-500" />
              <span className="font-bold text-xl text-primary-500">DealFlow AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Real Estate Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Close more deals with{' '}
            <span className="text-primary-500">intelligent automation</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Manage leads, automate follow-ups, and deliver exceptional client experiences—all powered by AI. Built for real estate professionals who want to work smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Everything you need to dominate your market
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              From lead capture to closing, DealFlow AI streamlines every step of your real estate business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Smart Lead Management',
                description:
                  'AI-powered lead scoring automatically prioritizes your hottest prospects. Never miss a follow-up again.',
              },
              {
                icon: FileText,
                title: 'Transaction Pipeline',
                description:
                  'Visual Kanban boards to track every deal from contract to close. Stay organized effortlessly.',
              },
              {
                icon: Sparkles,
                title: 'AI Writing Assistant',
                description:
                  'Generate personalized emails, market reports, and client communications in seconds with Claude AI.',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-card">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '40%', label: 'Less time on admin' },
              { value: '2.5x', label: 'Faster responses' },
              { value: '85%', label: 'Client satisfaction' },
              { value: '500+', label: 'Active agents' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-primary-500 mb-2">{stat.value}</div>
                <div className="text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your real estate business?
          </h2>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of agents who are already using DealFlow AI to close more deals and deliver better client experiences.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-primary-500 hover:bg-primary-50"
              icon={ArrowRight}
              iconPosition="right"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-white" />
              <span className="font-bold text-white">DealFlow AI</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} DealFlow AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
