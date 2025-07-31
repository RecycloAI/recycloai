import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Scan {
  id: string;
  user_id: string;
  waste_type: string;
  co2_saved: number;
  points_earned: number;
  image_url: string | null;
  created_at: string;
}

export default function ScanHistory() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScanHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const { data, error: fetchError } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        setScans(data || []);
      } catch (err) {
        console.error('Error fetching scan history:', err);
        setError(err.message || 'Failed to load scan history');
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
    return (
      <div className="text-red-500 text-center py-4">
        {error}
        {scans.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing previously loaded scans
          </p>
        )}
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-xl font-semibold">Your Scan History</h2>
        <p className="text-gray-500">No scans recorded yet</p>
        <p className="text-sm text-gray-400">
          Start scanning waste items to track your history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Recent Scans</h2>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Date
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                CO2 Saved
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Points
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Image
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {scans.map((scan) => (
              <tr key={scan.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                  {new Date(scan.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                  {scan.waste_type.replace(/_/g, ' ')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {scan.co2_saved.toFixed(2)} kg
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">
                  +{scan.points_earned}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {scan.image_url ? (
                    <a
                      href={scan.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {scans.length >= 50 && (
        <p className="text-sm text-gray-500 text-center">
          Showing most recent 50 scans
        </p>
      )}
    </div>
  );
}