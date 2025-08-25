'use client';

import { useState } from 'react';
import { isDemoMode } from '@/lib/env';

interface CheckoutButtonProps {
  priceId: string;
  className?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

export default function CheckoutButton({ priceId, className, children, 'data-testid': testId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // In demo mode, simulate success
    if (isDemoMode()) {
      alert('Demo Mode: Checkout completed successfully! In production, this would redirect to Stripe.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
      data-testid={testId}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
