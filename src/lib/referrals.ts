import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { cookies } from 'next/headers';

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  referral_code: string;
}

export const REFERRAL_COOKIE_NAME = 'signalnote_ref';

// Generate a unique referral code
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get referral code from cookie
export function getReferralCodeFromCookie(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(REFERRAL_COOKIE_NAME)?.value || null;
}

// Set referral code in cookie
export function setReferralCodeCookie(code: string): void {
  const cookieStore = cookies();
  cookieStore.set(REFERRAL_COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

// Clear referral code cookie
export function clearReferralCodeCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(REFERRAL_COOKIE_NAME);
}

// Get referral stats for a user
export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
  try {
    // Get user's referral code
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ref_code')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.ref_code) {
      return null;
    }

    // Count total referrals
    const { count: totalReferrals, error: totalError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    if (totalError) {
      console.error('Error counting referrals:', totalError);
      return null;
    }

    // Count successful referrals (users who signed up)
    const { count: successfulReferrals, error: successError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .not('referred_id', 'is', null);

    if (successError) {
      console.error('Error counting successful referrals:', successError);
      return null;
    }

    return {
      total_referrals: totalReferrals || 0,
      successful_referrals: successfulReferrals || 0,
      referral_code: profile.ref_code,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return null;
  }
}

// Create referral record
export async function createReferral(
  referrerId: string,
  referredEmail: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: null, // Will be updated when user signs up
      });

    if (error) {
      console.error('Error creating referral:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating referral:', error);
    return false;
  }
}

// Complete referral when user signs up
export async function completeReferral(
  referrerCode: string,
  newUserId: string
): Promise<boolean> {
  try {
    // Find the referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('ref_code', referrerCode)
      .single();

    if (referrerError || !referrer) {
      return false;
    }

    // Update the referral record
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ referred_id: newUserId })
      .eq('referrer_id', referrer.id)
      .is('referred_id', null)
      .limit(1);

    if (updateError) {
      console.error('Error updating referral:', updateError);
      return false;
    }

    // Update the new user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', newUserId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing referral:', error);
    return false;
  }
}

// Get referral link for a user
export function getReferralLink(refCode: string): string {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  return `${baseUrl}/signup?ref=${refCode}`;
}

// Send referral email (placeholder for future implementation)
export async function sendReferralEmail(
  referrerEmail: string,
  referralLink: string
): Promise<boolean> {
  // TODO: Implement email sending using Supabase Edge Functions or Resend
  // For now, just log the referral
  console.log(`Referral email would be sent to ${referrerEmail} with link: ${referralLink}`);
  return true;
} 