import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, TrendingUp, Award, History, User, Scan, Leaf } from 'lucide-react';
import Spinner from '@/components/Spinner';

// Lazy load heavy components with fallback
const PredictionUploader = lazy(() => import('../components/PredictionUploader'));
const ScanHistory = lazy(() => import('@/components/ScanHistory'));
const ImpactStats = lazy(() => import('@/components/ImpactStats'));
const Achievements = lazy(() => import('@/components/Achievements'));
const UserProfile = lazy(() => import('@/components/UserProfile'));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('scan');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userImpact, setUserImpact] = useState(null);
  const [rank, setRank] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const tabs = [
    { id: 'scan', name: 'Scan Waste', icon: <Camera className="h-5 w-5" /> },
    { id: 'history', name: 'Scan History', icon: <History className="h-5 w-5" /> },
    { id: 'stats', name: 'Impact Stats', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'achievements', name: 'Achievements', icon: <Award className="h-5 w-5" /> },
    { id: 'user', name: 'User Profile', icon: <User className="h-5 w-5" /> },
  ];

  useEffect(() => {
    const fetchUserImpactAndRank = async () => {
      if (!user?.id) return;
      
      setIsDataLoading(true);
      try {
        // Fetch all data in parallel for better performance
        const [impactResponse, rankResponse] = await Promise.all([
          supabase
            .from('user_impact_stats')
            .select('*')
            .eq('user_id', user.id)
            .single(),
          supabase
            .rpc('get_user_rank', { user_id: user.id })
        ]);

        setUserImpact(impactResponse.data);
        setRank(rankResponse.data);
      } catch (error) {
        console.error('Error fetching user impact or rank:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserImpactAndRank();
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/signin');
    }

    const savedTab = localStorage.getItem('lastActiveTab');
    if (savedTab && tabs.some(tab => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    localStorage.setItem('lastActiveTab', activeTab);
  }, [activeTab]);

// Update the handleScanSuccess function
const handleScanSuccess = async () => {
  setIsRefreshing(true);
  try {
    // Refresh all necessary data in parallel
    const [userData, impactData, rankData] = await Promise.all([
      refreshUser(),
      supabase
        .from('user_impact_stats')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase.rpc('get_user_rank', { user_id: user.id })
    ]);

    setUserImpact(impactData.data);
    setRank(rankData.data);
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    setIsRefreshing(false);
  }
};

  if (isLoading || isRefreshing || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Calculate derived stats - prioritize user_impact_stats if available
  const totalScans = userImpact?.total_scans || user.total_scans || 0;
  const co2Saved = userImpact?.total_co2_saved || user.co2_saved || 0;
  const points = userImpact?.total_points || user.points || 0;
  const avgCo2PerScan = totalScans > 0 ? (co2Saved / totalScans).toFixed(2) : 0;
  const mostCommonWaste = userImpact?.most_common_waste || 'None';

  const renderTabContent = () => {
    if (isDataLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      );
    }

    switch (activeTab) {
      case 'scan':
        return <PredictionUploader onSuccess={handleScanSuccess} />;
      case 'history':
        return <ScanHistory userId={user.id} />;
      case 'stats':
        return <ImpactStats userId={user.id} />;
      case 'achievements':
        return <Achievements userId={user.id} />;
      case 'user':
        return <UserProfile user={user} />;
      default:
        return <PredictionUploader onSuccess={handleScanSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name || user.email || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              {totalScans > 0 
                ? `You've prevented ${co2Saved.toFixed(2)}kg of CO₂ emissions! Keep it up!`
                : 'Start scanning waste to track your environmental impact.'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Scan className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CO₂ Saved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {co2Saved.toFixed(2)}kg
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points</p>
                  <p className="text-2xl font-bold text-gray-900">{points}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rank</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rank ? `#${rank}` : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg CO₂ per Scan</p>
                  <p className="text-xl font-bold text-gray-900">
                    {avgCo2PerScan}kg
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Common Waste</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">
                    {mostCommonWaste.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              <Suspense fallback={
                <div className="flex justify-center items-center h-64">
                  <Spinner />
                </div>
              }>
                {renderTabContent()}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;