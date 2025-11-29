'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Mail, Lock, User, Phone, Building2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Start closing deals smarter today
          </h1>
          <p className="text-lg text-primary-200">
            Join hundreds of agents who are automating their workflow and delighting their clients.
          </p>

          <div className="space-y-4">
            {[
              'AI-powered lead scoring and prioritization',
              'Automated follow-up sequences',
              'Real-time transaction tracking',
              'Client portal with progress updates',
              'Smart document management',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-secondary-400 flex-shrink-0" />
                <span className="text-primary-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-300">
          No credit card required. 14-day free trial.
        </p>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Building2 className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-primary-500">DealFlow AI</span>
          </div>

          <Card padding="lg" className="shadow-modal">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Create your account</h2>
              <p className="text-neutral-500 mt-2">Get started with your free trial</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  leftIcon={User}
                  required
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={Mail}
                required
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                name="phone"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={Phone}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                leftIcon={Lock}
                helperText="Must be at least 6 characters"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={Lock}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  size="lg"
                >
                  Create account
                </Button>
              </div>
            </form>

            <p className="mt-4 text-xs text-neutral-500 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary-500 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-500 hover:underline">
                Privacy Policy
              </Link>
            </p>

            <div className="mt-6 text-center">
              <p className="text-neutral-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
