'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, User, Mail, Phone, Home, DollarSign, FileText } from 'lucide-react';
import Link from 'next/link';

const sourceOptions = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'ZILLOW', label: 'Zillow' },
  { value: 'REALTOR', label: 'Realtor.com' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'OTHER', label: 'Other' },
];

const propertyTypes = [
  { value: 'SINGLE_FAMILY', label: 'Single Family Home' },
  { value: 'CONDO', label: 'Condo/Townhouse' },
  { value: 'MULTI_FAMILY', label: 'Multi-Family' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

export default function NewLeadPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'WEBSITE',
    propertyInterest: '',
    budget: '',
    preApproved: false,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        phone: formData.phone || undefined,
        propertyInterest: formData.propertyInterest || undefined,
        notes: formData.notes || undefined,
      };

      const response = await apiClient.post('/api/leads', payload, token);
      if (response.success) {
        router.push('/dashboard/leads');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Add New Lead</h1>
          <p className="text-neutral-500 mt-1">Enter the lead&apos;s information below</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-neutral-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
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
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-neutral-400" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={Mail}
                required
              />
              <Input
                label="Phone (Optional)"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={Phone}
              />
            </div>
          </div>

          {/* Lead Source */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Lead Source
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="input-base"
            >
              {sourceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Property Interest */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-neutral-400" />
              Property Interest
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Property Type
                </label>
                <select
                  name="propertyInterest"
                  value={formData.propertyInterest}
                  onChange={handleChange}
                  className="input-base"
                >
                  <option value="">Select type...</option>
                  {propertyTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Budget"
                name="budget"
                type="number"
                placeholder="500000"
                value={formData.budget}
                onChange={handleChange}
                leftIcon={DollarSign}
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="preApproved"
                  checked={formData.preApproved}
                  onChange={handleChange}
                  className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Pre-approved for financing</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-neutral-400" />
              Notes
            </h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information about this lead..."
              rows={4}
              className="input-base resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Link href="/dashboard/leads">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading}>
              Create Lead
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
