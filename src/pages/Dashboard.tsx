import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '../contexts/AuthContext';
import {WasteScanner} from '../components/WasteScanner';
import { Button } from '@/components/ui/button';
import { Camera, TrendingUp, Award, History, User, Scan } from 'lucide-react';
import Spinner from '@/components/Spinner';
import LoginPrompt from '@/components/LoginPrompt';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('scan');

  const tabs = [
    { id: 'scan', name: 'Scan Waste', icon: <Camera className="h-5 w-5" /> },
    { id: 'history', name: 'Scan History', icon: <History className="h-5 w-5" /> },
    { id: 'stats', name: 'Impact Stats', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'achievements', name: 'Achievements', icon: <Award className="h-5 w-5" /> },
    { id: 'user', name: 'User', icon: <User className="h-5 w-5" /> },
  ];

  if (isLoading) return <Spinner />;
  if (!user) return <div style={{color: 'red', textAlign: 'center', marginTop: '2rem'}}>Could not load user profile. Please try again or contact support.</div>;
  console.log('Dashboard user:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || user?.email || 'User'}!</h1>
          <p className="text-gray-600 mt-2">Track your recycling impact and continue making a difference.</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Scan className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{user?.total_scans ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CO2 Saved</p>
                <p className="text-2xl font-bold text-gray-900">{user?.co2_saved ?? 0}kg</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points</p>
                <p className="text-2xl font-bold text-gray-900">{user?.points ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rank</p>
                <p className="text-2xl font-bold text-gray-900">#47</p>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
            {activeTab === 'scan' && <WasteScanner />}
            {/* You can add the other tab contents here as needed */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
