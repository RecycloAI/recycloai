import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Scan {
  id: number;
  waste_type: string;
  co2_saved: number;
  points_earned: number;
  created_at: string;
  image_url?: string;
}

export default function ScanHistory() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScanHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setScans(data || []);
      } catch (err) {
        console.error('Error fetching scan history:', err);
        setError('Failed to load scan history');
      } finally {
        setLoading(false);
      }
    };

    fetchScanHistory();
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Recent Scans</h2>
      {scans.length === 0 ? (
        <p className="text-gray-500">No scan history yet</p>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CO2 Saved</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {scans.map((scan) => (
                <tr key={scan.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                    {scan.waste_type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {scan.co2_saved.toFixed(2)} kg
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    +{scan.points_earned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}