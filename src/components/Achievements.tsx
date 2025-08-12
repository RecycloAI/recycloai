import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2, Award as AwardIcon, CheckCircle } from 'lucide-react';

interface AchievementDefinition {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  points_threshold: number;
  created_at: string;
}

interface UserAchievement {
  id: number;
  achievement_id: number;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  definition: AchievementDefinition;
}

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch user's current points
        const { data: statsData, error: statsError } = await supabase
          .from('user_impact_stats')
          .select('total_points')
          .eq('user_id', user.id)
          .single();

        if (statsError) throw statsError;
        setTotalPoints(statsData?.total_points || 0);

        // Fetch user's achievements with definitions
        const { data, error: fetchError } = await supabase
          .from('user_achievements')
          .select(`
            id,
            unlocked,
            unlocked_at,
            progress,
            achievement_definitions:achievement_id (
              id,
              name,
              description,
              icon_url,
              points_threshold
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Format the data properly
        const formattedAchievements = data?.map(item => ({
          id: item.id,
          achievement_id: item.achievement_id,
          unlocked: item.unlocked,
          unlocked_at: item.unlocked_at,
          progress: item.progress,
          definition: item.achievement_definitions
        })) || [];

        setAchievements(formattedAchievements);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(err instanceof Error ? err.message : 'No scans recorded yet');
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  // Function to create or update achievements
  const updateUserAchievements = async () => {
    if (!user) return;

    try {
      // Get all achievement definitions
      const { data: definitions, error: defError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('points_threshold', { ascending: true });

      if (defError) throw defError;

      // For each definition, check if user qualifies
      for (const definition of definitions) {
        const isUnlocked = totalPoints >= definition.points_threshold;
        
        // Upsert the achievement status
        const { error: upsertError } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: definition.id,
            unlocked: isUnlocked,
            unlocked_at: isUnlocked ? new Date().toISOString() : null,
            progress: Math.min(totalPoints, definition.points_threshold)
          }, {
            onConflict: 'user_id,achievement_id'
          });

        if (upsertError) throw upsertError;
      }
    } catch (err) {
      console.error('Error updating achievements:', err);
    }
  };

  // Call this function when points change
  useEffect(() => {
    if (totalPoints > 0) {
      updateUserAchievements();
    }
  }, [totalPoints]);

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Achievements</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Total Points: {totalPoints}
        </div>
      </div>
      
      {achievements.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">No achievements found</p>
          <p className="text-sm text-blue-600 mt-1">
            Complete more scans to unlock achievements
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`bg-white p-4 rounded-lg shadow border flex items-start ${
                achievement.unlocked ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${
                achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {achievement.definition.icon_url ? (
                  <img 
                    src={achievement.definition.icon_url} 
                    alt={achievement.definition.name}
                    className="h-6 w-6"
                  />
                ) : (
                  <AwardIcon className={`h-6 w-6 ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{achievement.definition.name}</h3>
                  {achievement.unlocked && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{achievement.definition.description}</p>
                
                {!achievement.unlocked ? (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${Math.min(
                            (achievement.progress / achievement.definition.points_threshold) * 100, 
                            100
                          )}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.progress} / {achievement.definition.points_threshold} points
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-green-600 mt-1">
                    Unlocked on {new Date(achievement.unlocked_at!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}