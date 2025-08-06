import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2, ImageIcon, ExternalLink } from 'lucide-react';

interface WasteScan {
  id: string;
  user_id: string;
  waste_type: string;
  co2_saved: number;
  points_earned: number;
  image_url: string;
  confidence: number;
  created_at: string;
}

export default function ScanHistory() {
  const { user } = useAuth();
  const [scans, setScans] = useState<WasteScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchScanHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const { data, error: fetchError, count } = await supabase
          .from('waste_scans')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (fetchError) throw fetchError;

        setScans(prev => page === 1 ? data || [] : [...prev, ...(data || [])]);
        setHasMore(count ? count > page * itemsPerPage : false);
      } catch (err) {
        console.error('Error fetching scan history:', err);
        setError(err.message || 'Failed to load scan history');
      } finally {
        setLoading(false);
      }
    };

    fetchScanHistory();
  }, [user, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && scans.length === 0) {
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
          Start scanning waste items to track your environmental impact
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Scan History</h2>
        <p className="text-sm text-gray-500">
          {scans.length} scan{scans.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Date
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Waste Type
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Confidence
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                CO₂ Saved
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        scan.confidence > 0.8 ? 'bg-green-500' : 
                        scan.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${scan.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs mt-1 inline-block">
                    {(scan.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {scan.co2_saved.toFixed(2)} kg
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">
                  +{scan.points_earned}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <a
                    href={scan.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && scans.length > 0 && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
          >
            Load More
          </button>
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        <p>Note: Only the most recent scans are shown. Each scan helps reduce your environmental impact.</p>
      </div>
    </div>
  );
}