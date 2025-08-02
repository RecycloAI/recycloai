import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2, Award as AwardIcon } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  criteria: Record<string, unknown>;
  created_at: string;
}

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Directly fetch from achievements table
        const { data, error: fetchError } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setAchievements(data || []);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
        {achievements.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">Showing available data</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Available Achievements</h2>
      
      {achievements.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">No achievements found</p>
          <p className="text-sm text-blue-600 mt-1">
            Check back later for available achievements
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="bg-white p-4 rounded-lg shadow border border-green-200 flex items-start"
            >
              <div className="bg-green-100 p-3 rounded-full mr-4">
                {achievement.icon ? (
                  <img 
                    src={achievement.icon} 
                    alt={achievement.name}
                    className="h-6 w-6"
                  />
                ) : (
                  <AwardIcon className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-green-600 font-medium">+{achievement.points_reward} pts</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(achievement.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}