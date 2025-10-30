'use client';

import { useState } from 'react';

export default function QuestsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quest Management</h3>
            <p className="text-sm text-gray-600 mt-1">Create and manage quests and missions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Quest
          </button>
        </div>
      </div>

      {/* Quest Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Daily Quests</h4>
            <span className="text-2xl">📅</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-sm">Play 3 Games</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 50 gems</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-sm">Analyze 1 Game</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 30 gems</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-sm">Login Streak</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 20 gems</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Weekly Quests</h4>
            <span className="text-2xl">📆</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-sm">Win 20 Games</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 500 gems, 1 diamond</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-sm">Deep Scan Account</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 300 gems</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Special Quests</h4>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-sm">Refer 5 Friends</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 1000 gems, 5 diamonds</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-sm">Tournament Winner</div>
              <div className="text-xs text-gray-600 mt-1">Reward: 2000 gems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Quests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">All Active Quests</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quest Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rewards</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { name: 'Play 3 Games', category: 'DAILY', difficulty: 'EASY', reward: '50 gems', rate: 78 },
              { name: 'Win 20 Games', category: 'WEEKLY', difficulty: 'MEDIUM', reward: '500 gems', rate: 45 },
              { name: 'Refer 5 Friends', category: 'SOCIAL', difficulty: 'HARD', reward: '1000 gems', rate: 12 },
            ].map((quest, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{quest.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {quest.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{quest.difficulty}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-green-600">{quest.reward}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${quest.rate}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{quest.rate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
