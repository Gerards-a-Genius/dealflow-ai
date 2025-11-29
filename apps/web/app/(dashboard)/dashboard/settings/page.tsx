'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  User,
  Bell,
  Lock,
  Palette,
  Mail,
  Globe,
  Shield,
  Save,
  Moon,
  Sun,
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'preferences';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: '',
    website: '',
    bio: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    emailLeadActivity: true,
    emailTransactionUpdate: true,
    emailWeeklySummary: true,
    pushNewLead: true,
    pushMessages: true,
    pushReminders: true,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success('Profile updated', 'Your profile has been saved successfully.');
    } catch (err) {
      error('Update failed', 'There was an error saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success('Notifications updated', 'Your notification preferences have been saved.');
    } catch (err) {
      error('Update failed', 'There was an error saving your preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success('Preferences updated', 'Your preferences have been saved.');
    } catch (err) {
      error('Update failed', 'There was an error saving your preferences.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Lock },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 flex-shrink-0">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-neutral-500 mt-1">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>

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
                />

                <Input
                  label="Company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Your real estate company"
                />

                <Input
                  label="Website"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  leftIcon={Globe}
                  placeholder="https://yourwebsite.com"
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell clients about yourself..."
                    rows={4}
                    className="input-base resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <Button onClick={handleSaveProfile} loading={saving} icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Notification Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNewLead', label: 'New lead notifications', description: 'Get notified when a new lead is added' },
                      { key: 'emailLeadActivity', label: 'Lead activity updates', description: 'Updates when leads interact with your content' },
                      { key: 'emailTransactionUpdate', label: 'Transaction updates', description: 'Important updates on your transactions' },
                      { key: 'emailWeeklySummary', label: 'Weekly summary', description: 'Weekly recap of your activity' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({ ...notifications, [item.key]: e.target.checked })
                          }
                          className="mt-1 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-neutral-400" />
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'pushNewLead', label: 'New leads', description: 'Instant alerts for new leads' },
                      { key: 'pushMessages', label: 'Messages', description: 'Notifications for new messages' },
                      { key: 'pushReminders', label: 'Reminders', description: 'Task and appointment reminders' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({ ...notifications, [item.key]: e.target.checked })
                          }
                          className="mt-1 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <Button onClick={handleSaveNotifications} loading={saving} icon={Save}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Security Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-neutral-400" />
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <Input label="Current Password" type="password" />
                    <Input label="New Password" type="password" />
                    <Input label="Confirm New Password" type="password" />
                    <Button>Update Password</Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-neutral-400" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Add an extra layer of security to your account by requiring a verification code in addition to your password.
                  </p>
                  <Button variant="secondary">Enable 2FA</Button>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="font-medium text-red-600 mb-3">Danger Zone</h3>
                  <p className="text-neutral-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="danger">Delete Account</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">App Preferences</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Theme</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setPreferences({ ...preferences, theme: theme.value })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          preferences.theme === theme.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <theme.icon className="h-4 w-4" />
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="input-base max-w-md"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    className="input-base max-w-md"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="input-base max-w-md"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <Button onClick={handleSavePreferences} loading={saving} icon={Save}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
