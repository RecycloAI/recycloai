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

export default function ImpactStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImpactStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_impact_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setStats(data);
      } catch (err) {
        console.error('Error fetching impact stats:', err);
        setError('Failed to load impact statistics');
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
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!stats) {
    return <div className="text-gray-500 text-center py-4">No statistics available</div>;
  }

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
                <Bar dataKey="value" fill="#8884d8" name="Waste Type" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-medium mb-4">CO2 Savings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={co2Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="kg" fill="#82ca9d" name="kg of CO2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Scans</p>
          <p className="text-2xl font-bold">{stats.total_scans}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Active Days</p>
          <p className="text-2xl font-bold">{stats.active_days}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Points</p>
          <p className="text-2xl font-bold">{stats.total_points}</p>
        </div>
      </div>
    </div>
  );
}