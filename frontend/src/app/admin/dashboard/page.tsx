'use client';

import { useEffect, useState } from 'react';
import { adminAPI, type AdminStats } from '@/lib/admin/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers.toLocaleString(),
      change: '+8.2%',
      icon: '⚡',
      color: 'green',
    },
    {
      title: 'Total Games',
      value: stats?.totalGames.toLocaleString(),
      change: '+15.3%',
      icon: '♟️',
      color: 'purple',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue.toLocaleString()}`,
      change: '+23.1%',
      icon: '💰',
      color: 'yellow',
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.pendingWithdrawals.toString(),
      change: '-5.4%',
      icon: '🏦',
      color: 'red',
    },
    {
      title: 'Today Signups',
      value: stats?.todaySignups.toString(),
      change: '+34.7%',
      icon: '🎉',
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                <p
                  className={`mt-2 text-sm ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Signups</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">U{i}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">player{i}23</p>
                    <p className="text-xs text-gray-500">player{i}@example.com</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{i} min ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600">💰</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Gems Purchase</p>
                    <p className="text-xs text-gray-500">player{i}23</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  +{(i * 100).toLocaleString()} 💎
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📧 Send Announcement
          </button>
          <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            🎯 Create Quest
          </button>
          <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            🏆 New Tournament
          </button>
          <button className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            ⚙️ System Settings
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Server</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✅ Operational
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              ⚠️ Not Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Chess.com API</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✅ Operational
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email Service</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✅ Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
