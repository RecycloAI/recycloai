import { supabase, ScanResult, User } from './supabase';

export const scanService = {
  // Save scan result to database
  async saveScanResult(userId: string, scanData: Omit<ScanResult, 'id' | 'user_id' | 'created_at'>): Promise<ScanResult | null> {
    try {
      const { data, error } = await supabase
        .from('scan_results')
        .insert([
          {
            user_id: userId,
            material: scanData.material,
            confidence: scanData.confidence,
            instructions: scanData.instructions,
            bin_color: scanData.bin_color,
            recyclable: scanData.recyclable,
            image_url: scanData.image_url,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving scan result:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving scan result:', error);
      return null;
    }
  },

  // Get user's scan history
  async getScanHistory(userId: string): Promise<ScanResult[]> {
    try {
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scan history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching scan history:', error);
      return [];
    }
  },

  // Update user stats after scan
  async updateUserStats(userId: string, co2Saved: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          total_scans: supabase.rpc('increment', { row_id: userId, column_name: 'total_scans' }),
          co2_saved: supabase.rpc('increment', { row_id: userId, column_name: 'co2_saved', amount: co2Saved }),
          points: supabase.rpc('increment', { row_id: userId, column_name: 'points', amount: 10 }),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user stats:', error);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  },

  // Upload image to Supabase Storage
  async uploadImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('waste-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('waste-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  },
}; 