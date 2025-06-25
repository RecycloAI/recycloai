import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Scan, 
  TrendingUp, 
  Database, 
  Settings, 
  BarChart3,
  Activity,
  AlertTriangle
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'users', name: 'Users', icon: <Users className="h-5 w-5" /> },
    { id: 'scans', name: 'Scan Data', icon: <Scan className="h-5 w-5" /> },
    { id: 'ai-performance', name: 'AI Performance', icon: <Activity className="h-5 w-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  // Mock data
  const statsData = {
    totalUsers: 2547,
    totalScans: 15683,
    avgAccuracy: 96.8,
    co2Saved: 1247.3,
    newUsersToday: 23,
    scansToday: 156,
    systemUptime: 99.9
  };

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@test.com', joined: '2 hours ago', scans: 5 },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com', joined: '5 hours ago', scans: 12 },
    { id: 3, name: 'Mike Johnson', email: 'mike@test.com', joined: '1 day ago', scans: 8 },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@test.com', joined: '2 days ago', scans: 15 },
  ];

  const recentScans = [
    { id: 1, user: 'John Doe', item: 'Plastic Bottle', confidence: 97, result: 'Correct', time: '5 min ago' },
    { id: 2, user: 'Jane Smith', item: 'Aluminum Can', confidence: 95, result: 'Correct', time: '12 min ago' },
    { id: 3, user: 'Mike Johnson', item: 'Glass Jar', confidence: 92, result: 'Corrected', time: '18 min ago' },
    { id: 4, user: 'Sarah Wilson', item: 'Paper Cup', confidence: 88, result: 'Correct', time: '25 min ago' },
  ];

  const wasteCategories = [
    { category: 'Plastic', count: 5642, percentage: 36 },
    { category: 'Paper', count: 3821, percentage: 24 },
    { category: 'Glass', count: 2456, percentage: 16 },
    { category: 'Metal', count: 2134, percentage: 14 },
    { category: 'Organic', count: 1630, percentage: 10 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor app performance and user activity</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{statsData.newUsersToday} today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Scan className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.totalScans.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{statsData.scansToday} today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.avgAccuracy}%</p>
                <p className="text-xs text-green-600">+0.2% this week</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CO2 Saved</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.co2Saved}kg</p>
                <p className="text-xs text-green-600">This month</p>
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{user.scans} scans</p>
                            <p className="text-xs text-gray-500">{user.joined}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Health */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-green-800">API Uptime</span>
                        <span className="font-medium text-green-600">{statsData.systemUptime}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-800">Database Status</span>
                        <span className="font-medium text-blue-600">Healthy</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-800">AI Model Status</span>
                        <span className="font-medium text-purple-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waste Categories */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Most Scanned Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {wasteCategories.map((category) => (
                      <div key={category.category} className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-2xl font-bold text-green-600">{category.count}</p>
                        <p className="text-sm text-gray-600">{category.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <Button>Export Users</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scans
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.scans}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.joined}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="outline" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'scans' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Scans</h3>
                  <Button>Export Data</Button>
                </div>
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{scan.item}</p>
                        <p className="text-sm text-gray-600">by {scan.user}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Confidence: {scan.confidence}%</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.result === 'Correct' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {scan.result}
                        </span>
                        <span className="text-sm text-gray-500">{scan.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai-performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">AI Model Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-800 mb-2">Overall Accuracy</h4>
                    <p className="text-3xl font-bold text-green-600">{statsData.avgAccuracy}%</p>
                    <p className="text-sm text-green-700 mt-2">Last 30 days</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">Processing Speed</h4>
                    <p className="text-3xl font-bold text-blue-600">1.2s</p>
                    <p className="text-sm text-blue-700 mt-2">Average response time</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Model Version</h4>
                    <p className="text-3xl font-bold text-purple-600">v2.1</p>
                    <p className="text-sm text-purple-700 mt-2">Latest deployment</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-yellow-800">
                      Model retaining scheduled for next week to improve glass detection accuracy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-600">Temporarily disable scanning for maintenance</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">AI Model Settings</h4>
                      <p className="text-sm text-gray-600">Configure model parameters and thresholds</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Export</h4>
                      <p className="text-sm text-gray-600">Export user data and analytics</p>
                    </div>
                    <Button variant="outline">Export</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
