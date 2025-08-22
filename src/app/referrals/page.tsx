'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  referral_code: string;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats?.referral_code) return;

    const referralLink = `${window.location.origin}/signup?ref=${stats.referral_code}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareReferral = async () => {
    if (!stats?.referral_code) return;

    const referralLink = `${window.location.origin}/signup?ref=${stats.referral_code}`;
    const text = `I've been using SignalNote to analyze customer feedback. It finds patterns and insights instantly. Join with my link and try it out: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SignalNote',
          text,
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying
      copyReferralLink();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load referrals</h2>
          <p className="text-gray-600 mb-6">
            There was an error loading your referral information.
          </p>
          <Button onClick={fetchReferralStats}>
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
            Your Referrals
          </h1>
          <p className="text-xl text-gray-600">
            Share SignalNote with your team and track your referral success.
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.total_referrals}
            </div>
            <div className="text-gray-600">Total Referrals</div>
            <div className="text-sm text-gray-500 mt-1">People who used your link</div>
          </Card>

          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.successful_referrals}
            </div>
            <div className="text-gray-600">Successful Signups</div>
            <div className="text-sm text-gray-500 mt-1">People who joined</div>
          </Card>

          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.total_referrals > 0 
                ? Math.round((stats.successful_referrals / stats.total_referrals) * 100)
                : 0
              }%
            </div>
            <div className="text-gray-600">Conversion Rate</div>
            <div className="text-sm text-gray-500 mt-1">Signup success rate</div>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Referral Link
            </h2>
            <p className="text-gray-600 mb-6">
              Share this link with your team, colleagues, or anyone who might benefit from SignalNote.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 bg-gray-100 rounded-lg p-3 text-sm font-mono text-gray-700 break-all">
                  {`${window.location.origin}/signup?ref=${stats.referral_code}`}
                </div>
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={shareReferral} className="flex-1 sm:flex-none">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                  </svg>
                  Share Referral Link
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral Tips */}
        <Card className="bg-blue-50 border-blue-200 mb-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Referral Tips</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Share with Your Team</h4>
                <p>Invite product managers, designers, and engineers who work with customer feedback</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Post in Communities</h4>
                <p>Share in relevant Slack channels, Discord servers, or professional groups</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Personal Outreach</h4>
                <p>Send personalized messages to colleagues who might find value in the tool</p>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="mb-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">How Referrals Work</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Share Your Link</h4>
                <p className="text-sm text-gray-600">
                  Copy and share your unique referral link with potential users
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">They Sign Up</h4>
                <p className="text-sm text-gray-600">
                  When someone uses your link to sign up, it's tracked automatically
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Track Success</h4>
                <p className="text-sm text-gray-600">
                  Monitor your referral stats and see who's joining through your link
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
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