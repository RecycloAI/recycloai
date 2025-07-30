import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh the session when it expires
    autoRefreshToken: true,
    // Persist the session in localStorage
    persistSession: true,
    // Detect session in the URL for OAuth flows
    detectSessionInUrl: true,
  },
});

// Export types for convenience
export type { Session, User } from '@supabase/supabase-js';


// Helper function to get user profile with stats
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// Function to add a new scan and update user stats
export const addScan = async (userId: string, wasteType: string, imageUrl?: string) => {
  const co2Saved = await supabase.rpc('calculate_co2_saved', { 
    waste_type: wasteType 
  });
  
  const pointsEarned = await supabase.rpc('calculate_points', { 
    waste_type: wasteType 
  });

  if (co2Saved.error || pointsEarned.error) {
    console.error('Error calculating scan metrics:', co2Saved.error || pointsEarned.error);
    return null;
  }

  // Insert the new scan
  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      waste_type: wasteType,
      co2_saved: co2Saved.data,
      points_earned: pointsEarned.data,
      image_url: imageUrl
    })
    .select()
    .single();

  if (scanError) {
    console.error('Error saving scan:', scanError);
    return null;
  }

  // Update user stats
  const { error: updateError } = await supabase.rpc('increment_user_stats', {
    user_id: userId,
    points: pointsEarned.data,
    co2_saved: co2Saved.data
  });

  if (updateError) {
    console.error('Error updating user stats:', updateError);
    return null;
  }

  // Check for new achievements
  await checkForNewAchievements(userId);

  return scanData;
};

// Function to check and award new achievements
const checkForNewAchievements = async (userId: string) => {
  const { data: achievements, error } = await supabase
    .rpc('check_achievements', { user_id: userId });

  if (error) {
    console.error('Error checking achievements:', error);
    return;
  }

  if (achievements && achievements.length > 0) {
    // You might want to notify the user about new achievements here
    console.log('New achievements earned:', achievements);
  }
};

// Function to get user rank
export const getUserRank = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_user_rank', { user_id: userId });

  if (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }

  return data;
};

// Function to get scan history
export const getScanHistory = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching scan history:', error);
    return null;
  }

  return data;
};