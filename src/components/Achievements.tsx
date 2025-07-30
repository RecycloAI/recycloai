import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2, Award as AwardIcon } from 'lucide-react';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
}

interface UserAchievement extends Achievement {
  earned_at: string;
}

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user's earned achievements
        const { data: userAchievements, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at, achievements(*)')
          .eq('user_id', user.id);

        if (userError) throw userError;

        // Fetch all available achievements
        const { data: allAchieves, error: allError } = await supabase
          .from('achievements')
          .select('*');

        if (allError) throw allError;

        setAchievements(userAchievements?.map(ua => ({
          ...ua.achievements,
          earned_at: ua.earned_at
        })) || []);
        
        setAllAchievements(allAchieves || []);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements');
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
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Achievements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <div key={achievement.id} className="bg-white p-4 rounded-lg shadow flex items-start">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <AwardIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Earned on {new Date(achievement.earned_at).toLocaleDateString()} • +{achievement.points_reward} pts
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No achievements earned yet</p>
        )}
      </div>

      <h3 className="text-lg font-medium mt-8">Available Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allAchievements.map((achievement) => {
          const isEarned = achievements.some(a => a.id === achievement.id);
          return (
            <div 
              key={achievement.id} 
              className={`p-4 rounded-lg shadow flex items-start border ${
                isEarned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white opacity-70'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${
                isEarned ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <AwardIcon className={`h-6 w-6 ${
                  isEarned ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Reward: +{achievement.points_reward} pts • {isEarned ? 'Earned' : 'Not earned'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}