'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Mail, Lock, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-10 w-10 text-white" />
          <span className="text-2xl font-bold text-white">DealFlow AI</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Close more deals with AI-powered automation
          </h1>
          <p className="text-lg text-primary-200">
            Manage leads, automate follow-ups, and deliver exceptional client experiences—all in one platform.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-secondary-400">40%</div>
              <div className="text-sm text-primary-200">Less time on admin</div>
            </div>
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-secondary-400">2.5x</div>
              <div className="text-sm text-primary-200">Faster responses</div>
            </div>
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-secondary-400">85%</div>
              <div className="text-sm text-primary-200">Client satisfaction</div>
            </div>
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-secondary-400">24/7</div>
              <div className="text-sm text-primary-200">AI assistance</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-300">
          Trusted by 500+ real estate professionals
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Building2 className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-primary-500">DealFlow AI</span>
          </div>

          <Card padding="lg" className="shadow-modal">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Welcome back</h2>
              <p className="text-neutral-500 mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="agent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={Mail}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={Lock}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-neutral-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                size="lg"
              >
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-500 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                  Create account
                </Link>
              </p>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
              <p className="text-xs text-neutral-500 text-center">
                Demo: <span className="font-mono">agent@dealflow.ai</span> / <span className="font-mono">demo123</span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
