import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2, Award as AwardIcon, CheckCircle, Lock } from 'lucide-react';

interface AchievementDefinition {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  points_threshold: number;
  created_at: string;
}

interface UserAchievement {
  id?: number;
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
  const [allDefinitions, setAllDefinitions] = useState<AchievementDefinition[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch all achievement definitions
        const { data: definitions, error: defError } = await supabase
          .from('achievement_definitions')
          .select('*')
          .order('points_threshold', { ascending: true });

        if (defError) throw defError;
        setAllDefinitions(definitions || []);

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
          .eq('user_id', user.id);

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

        // Merge with all definitions to show all possible achievements
        const mergedAchievements = definitions?.map(def => {
          const userAchievement = formattedAchievements.find(a => a.achievement_id === def.id);
          return userAchievement || {
            achievement_id: def.id,
            unlocked: false,
            unlocked_at: null,
            progress: Math.min(totalPoints, def.points_threshold),
            definition: def
          };
        }) || [];

        setAchievements(mergedAchievements);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, totalPoints]);

  // Function to update achievements when points change
  const updateUserAchievements = async () => {
    if (!user || !allDefinitions.length) return;

    try {
      const updates = allDefinitions.map(definition => ({
        user_id: user.id,
        achievement_id: definition.id,
        unlocked: totalPoints >= definition.points_threshold,
        unlocked_at: totalPoints >= definition.points_threshold ? new Date().toISOString() : null,
        progress: Math.min(totalPoints, definition.points_threshold)
      }));

      // Upsert all achievements at once
      const { error: upsertError } = await supabase
        .from('user_achievements')
        .upsert(updates, {
          onConflict: 'user_id,achievement_id'
        });

      if (upsertError) throw upsertError;

      // Update local state
      setAchievements(prev => prev.map(achievement => {
        const definition = allDefinitions.find(d => d.id === achievement.achievement_id);
        if (!definition) return achievement;
        
        return {
          ...achievement,
          unlocked: totalPoints >= definition.points_threshold,
          unlocked_at: totalPoints >= definition.points_threshold ? new Date().toISOString() : null,
          progress: Math.min(totalPoints, definition.points_threshold)
        };
      }));
    } catch (err) {
      console.error('Error updating achievements:', err);
    }
  };

  useEffect(() => {
    if (totalPoints > 0 && allDefinitions.length > 0) {
      updateUserAchievements();
    }
  }, [totalPoints, allDefinitions]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.achievement_id} 
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
              ) : achievement.unlocked ? (
                <AwardIcon className="h-6 w-6 text-green-600" />
              ) : (
                <Lock className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{achievement.definition.name}</h3>
                {achievement.unlocked ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-xs text-gray-500">
                    {achievement.definition.points_threshold} pts
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{achievement.definition.description}</p>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      achievement.unlocked ? 'bg-green-500' : 'bg-blue-600'
                    }`} 
                    style={{
                      width: `${Math.min(
                        (achievement.progress / achievement.definition.points_threshold) * 100, 
                        100
                      )}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.unlocked ? (
                    <span className="text-green-600">
                      Unlocked on {new Date(achievement.unlocked_at!).toLocaleDateString()}
                    </span>
                  ) : (
                    `${achievement.progress} / ${achievement.definition.points_threshold} points`
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}