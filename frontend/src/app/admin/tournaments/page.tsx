'use client';

import { useState } from 'react';

export default function TournamentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tournament Management</h3>
            <p className="text-sm text-gray-600 mt-1">Create and manage chess tournaments</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Create Tournament
          </button>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Active Tournaments</div>
          <div className="text-2xl font-bold text-blue-600">5</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total Participants</div>
          <div className="text-2xl font-bold text-green-600">1,234</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Prize Pool</div>
          <div className="text-2xl font-bold text-purple-600">50,000 💎</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-600">127</div>
        </div>
      </div>

      {/* Active Tournaments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Active Tournaments</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Pool</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              {
                name: 'Weekly Blitz Championship',
                type: 'BLITZ',
                format: 'SWISS',
                participants: 256,
                prizePool: '10,000',
                status: 'IN_PROGRESS',
              },
              {
                name: 'Beginner Arena',
                type: 'RAPID',
                format: 'ARENA',
                participants: 128,
                prizePool: '5,000',
                status: 'OPEN',
              },
              {
                name: 'Grand Masters Cup',
                type: 'RAPID',
                format: 'KNOCKOUT',
                participants: 64,
                prizePool: '25,000',
                status: 'UPCOMING',
              },
            ].map((tournament, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{tournament.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{tournament.format}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{tournament.participants}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-purple-600">{tournament.prizePool} 💎</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tournament.status === 'IN_PROGRESS'
                        ? 'bg-green-100 text-green-800'
                        : tournament.status === 'OPEN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tournament.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    <button className="text-yellow-600 hover:text-yellow-800 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tournament Templates */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tournament Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
            <h4 className="font-semibold text-gray-900">⚡ Blitz Arena</h4>
            <p className="text-sm text-gray-600 mt-1">3+2 time control, Arena format</p>
            <p className="text-xs text-gray-500 mt-2">Entry: 100 gems • Prize: 5,000 gems</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
            <h4 className="font-semibold text-gray-900">🏆 Swiss Tournament</h4>
            <p className="text-sm text-gray-600 mt-1">10+0 time control, Swiss format</p>
            <p className="text-xs text-gray-500 mt-2">Entry: 200 gems • Prize: 10,000 gems</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
            <h4 className="font-semibold text-gray-900">⚔️ Knockout Battle</h4>
            <p className="text-sm text-gray-600 mt-1">5+3 time control, Knockout</p>
            <p className="text-xs text-gray-500 mt-2">Entry: 500 gems • Prize: 25,000 gems</p>
          </div>
        </div>
      </div>
    </div>
  );
}
