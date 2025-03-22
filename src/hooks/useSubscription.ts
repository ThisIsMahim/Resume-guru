import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'premium' | 'business';

interface Subscription {
  tier: SubscriptionTier;
  active: boolean;
  expiresAt: Date | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        if (!user) {
          setSubscription(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          throw error;
        }

        if (data) {
          setSubscription({
            tier: data.tier as SubscriptionTier,
            active: data.active,
            expiresAt: data.expires_at ? new Date(data.expires_at) : null
          });
        } else {
          // No subscription found, default to free tier
          setSubscription({
            tier: 'free',
            active: true,
            expiresAt: null
          });
        }
      } catch (err) {
        console.error('Error in subscription hook:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set default free tier subscription even on error
        setSubscription({
          tier: 'free',
          active: true,
          expiresAt: null
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const checkDownloadLimit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_download_limit', { user_id: user.id });

      if (error) {
        console.error('Error checking download limit:', error);
        return false;
      }

      return data || false;
    } catch (err) {
      console.error('Error checking download limit:', err);
      return false;
    }
  };

  const recordDownload = async (resumeName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('downloads')
        .insert({
          user_id: user.id,
          resume_name: resumeName,
          format: 'pdf'
        });

      if (error) {
        console.error('Error recording download:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error recording download:', err);
      throw err;
    }
  };

  return {
    subscription,
    loading,
    error,
    checkDownloadLimit,
    recordDownload,
    isFreeTier: subscription?.tier === 'free',
    isPremiumTier: subscription?.tier === 'premium',
    isBusinessTier: subscription?.tier === 'business'
  };
} 