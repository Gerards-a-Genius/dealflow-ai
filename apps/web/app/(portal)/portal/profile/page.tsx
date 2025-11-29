'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function PortalProfilePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success('Profile updated', 'Your information has been saved successfully.');
    } catch (err) {
      error('Update failed', 'There was an error saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        <p className="text-neutral-500">Manage your personal information</p>
      </div>

      <Card>
        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-200">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-neutral-500">{profile.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
              <Input
                label="Last Name"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                leftIcon={Mail}
              />
              <Input
                label="Phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                leftIcon={Phone}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Current Address
            </h3>
            <div className="space-y-4">
              <Input
                label="Street Address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="123 Main Street"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Austin"
                />
                <Input
                  label="State"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="TX"
                />
                <Input
                  label="ZIP Code"
                  value={profile.zip}
                  onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                  placeholder="78701"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-neutral-200">
            <Button onClick={handleSave} loading={saving} icon={Save}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences Card */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Communication Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Email notifications', description: 'Receive updates about your transaction via email' },
            { label: 'SMS notifications', description: 'Get text messages for important updates' },
            { label: 'Weekly summary', description: 'Receive a weekly summary of your transaction progress' },
          ].map((pref, index) => (
            <label key={index} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={index < 2}
                className="mt-1 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-neutral-900">{pref.label}</p>
                <p className="text-sm text-neutral-500">{pref.description}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
