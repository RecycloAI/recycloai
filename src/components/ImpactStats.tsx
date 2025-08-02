import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ImpactStats {
  total_scans: number;
  total_co2_saved: number;
  total_points: number;
  active_days: number;
  avg_co2_per_scan: number;
  most_common_waste: string;
}

const DEFAULT_STATS: ImpactStats = {
  total_scans: 0,
  total_co2_saved: 0,
  total_points: 0,
  active_days: 0,
  avg_co2_per_scan: 0,
  most_common_waste: "None"
};

export default function ImpactStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImpactStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch user's impact stats
        const { data, error: fetchError } = await supabase
          .from('user_impact_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        setStats(data || DEFAULT_STATS);
      } catch (err) {
        console.error('Error fetching impact stats:', err);
        setError(err.message || 'Failed to load impact statistics');
        setStats(DEFAULT_STATS); // Provide fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchImpactStats();
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
        {stats && <p className="text-sm text-gray-500 mt-2">Showing default statistics</p>}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-xl font-semibold">Your Impact Statistics</h2>
        <p className="text-gray-500">No statistics available yet</p>
        <p className="text-sm text-gray-400">
          Start scanning waste items to see your environmental impact
        </p>
      </div>
    );
  }

  const hasData = stats.total_scans > 0;
  const wasteTypeData = [
    { name: 'Most Common', value: stats.most_common_waste },
  ];

  const co2Data = [
    { name: 'Total CO2 Saved', kg: stats.total_co2_saved },
    { name: 'Avg per Scan', kg: stats.avg_co2_per_scan },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Your Impact Statistics</h2>
      
      {!hasData ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">You haven't recorded any scans yet</p>
          <p className="text-sm text-blue-600 mt-1">
            Scan your first waste item to start tracking your environmental impact
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4">Waste Type Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#8884d8" 
                      name="Waste Type" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Most scanned waste type: <span className="font-medium">{stats.most_common_waste}</span>
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4">CO2 Savings</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={co2Data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg`, 'CO2 Saved']} />
                    <Legend />
                    <Bar 
                      dataKey="kg" 
                      fill="#82ca9d" 
                      name="kg of CO2" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Equivalent to planting about <span className="font-medium">{Math.round(stats.total_co2_saved / 21)} trees</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Total Scans</p>
              <p className="text-2xl font-bold">{stats.total_scans}</p>
              <p className="text-xs text-gray-400 mt-1">All time scans</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Active Days</p>
              <p className="text-2xl font-bold">{stats.active_days}</p>
              <p className="text-xs text-gray-400 mt-1">Days with scans</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-2xl font-bold">{stats.total_points}</p>
              <p className="text-xs text-gray-400 mt-1">Earned rewards</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}