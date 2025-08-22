'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Badge from '@/components/Badge';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  ref_code: string;
  created_at: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({ name: data.profile.name || '' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        fetchProfile(); // Refresh profile data
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success_url: `${window.location.origin}/dashboard?upgraded=true`,
          cancel_url: `${window.location.origin}/settings`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      setError('Failed to start upgrade process');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load profile</h2>
          <p className="text-gray-600 mb-6">
            There was an error loading your profile information.
          </p>
          <Button onClick={fetchProfile}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Account Settings
          </h1>
          <p className="text-xl text-gray-600">
            Manage your profile, subscription, and account preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    value={profile.ref_code}
                    disabled
                    className="w-full bg-gray-50 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(profile.ref_code)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Share this code with others to earn referrals</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Card>

          {/* Subscription & Account */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Current Plan</h3>
                    <p className="text-sm text-gray-600">
                      {profile.role === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </p>
                  </div>
                  <Badge variant={profile.role === 'pro' ? 'default' : 'outline'}>
                    {profile.role === 'pro' ? 'Active' : 'Free'}
                  </Badge>
                </div>

                {profile.role === 'free' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Upgrade to Pro</h4>
                    <p className="text-sm text-blue-800 mb-4">
                      Unlock AI-powered analysis, semantic search, clustering, and advanced insights.
                    </p>
                    <Button onClick={handleUpgrade} className="w-full">
                      Upgrade to Pro - $100/month
                    </Button>
                  </div>
                )}

                {profile.role === 'pro' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Pro Features Active</h4>
                    <p className="text-sm text-green-800">
                      You have access to all Pro features including AI analysis and clustering.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Actions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
              
              <div className="space-y-4">
                <Link href="/referrals">
                  <Button variant="outline" className="w-full justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                    Manage Referrals
                  </Button>
                </Link>

                <Link href="/pricing">
                  <Button variant="outline" className="w-full justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    View Pricing
                  </Button>
                </Link>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // TODO: Implement account deletion
                      alert('Account deletion not implemented in beta');
                    }
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Account
                </button>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account ID:</span>
                  <span className="font-mono text-gray-900">{profile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 