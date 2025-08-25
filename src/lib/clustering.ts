import { createClient } from '@supabase/supabase-js';
import { getServerEnv } from './env';

export interface Cluster {
  id: number;
  name: string;
  description: string;
  feedback_ids: number[];
  created_at: string;
}

export async function createCluster(name: string, description: string, feedbackIds: number[]): Promise<Cluster | null> {
  try {
    const env = getServerEnv();
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Service role key not configured');
      return null;
    }

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .from('clusters')
      .insert({
        name,
        description,
        feedback_ids: feedbackIds
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create cluster:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Cluster creation error:', error);
    return null;
  }
}

export async function getClusters(): Promise<Cluster[]> {
  try {
    const env = getServerEnv();
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Service role key not configured');
      return [];
    }

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .from('clusters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch clusters:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Cluster fetch error:', error);
    return [];
  }
} 