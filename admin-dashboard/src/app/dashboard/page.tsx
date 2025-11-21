'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'

interface DashboardStats {
  todayCheckins: number
  currentlyCheckedIn: number
  currentlyCheckedInUsers: Array<{ user: any; checkinTime: string }>
  violationsToday: number
  totalUsers: number
  totalZones: number
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard')
      return response.data.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const statCards = [
    {
      title: 'Today\'s Check-ins',
      value: stats?.todayCheckins || 0,
      icon: '✅',
      color: 'bg-blue-500',
      href: '/dashboard/attendance',
    },
    {
      title: 'Currently Checked In',
      value: stats?.currentlyCheckedIn || 0,
      icon: '🟢',
      color: 'bg-green-500',
      href: '/dashboard/attendance',
    },
    {
      title: 'Violations Today',
      value: stats?.violationsToday || 0,
      icon: '⚠️',
      color: 'bg-red-500',
      href: '/dashboard/reports',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-purple-500',
      href: '/dashboard/users',
    },
    {
      title: 'Work Zones',
      value: stats?.totalZones || 0,
      icon: '📍',
      color: 'bg-yellow-500',
      href: '/dashboard/geofence',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your attendance system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Currently Checked In Users */}
      {stats?.currentlyCheckedInUsers && stats.currentlyCheckedInUsers.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Currently Checked In</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.currentlyCheckedInUsers.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.firstName} {item.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{item.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.user?.employeeId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.user?.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.checkinTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/users?action=create"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-2xl mr-3">➕</span>
              <span className="text-sm font-medium text-gray-700">Add New User</span>
            </Link>
            <Link
              href="/dashboard/geofence?action=create"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-2xl mr-3">📍</span>
              <span className="text-sm font-medium text-gray-700">Create Work Zone</span>
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-2xl mr-3">📊</span>
              <span className="text-sm font-medium text-gray-700">Generate Report</span>
            </Link>
            <Link
              href="/dashboard/attendance"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-2xl mr-3">👀</span>
              <span className="text-sm font-medium text-gray-700">View Attendance</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


