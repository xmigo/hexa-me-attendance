'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface AttendanceRecord {
  id: string
  userId: string
  type: 'checkin' | 'checkout'
  timestamp: string
  latitude: number
  longitude: number
  accuracy?: number
  isWithinZone: boolean
  biometricVerified: boolean
  biometricType?: string
  isViolation: boolean
  violationReason?: string
  user?: {
    firstName: string
    lastName: string
    email: string
    employeeId?: string
    department?: string
  }
}

interface DailyAttendance {
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
    employeeId?: string
    department?: string
  }
  checkIn?: AttendanceRecord
  checkOut?: AttendanceRecord
  totalHours?: number
  status: 'present' | 'absent' | 'late' | 'early-departure'
}

export default function AttendancePage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'timetable' | 'records'>('timetable')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-records', dateFilter],
    queryFn: async () => {
      const response = await api.get(`/reports/daily?date=${dateFilter}`)
      return response.data.data
    },
  })

  // Process data into timetable format
  const processedData: DailyAttendance[] = data?.checkins?.reduce((acc: DailyAttendance[], record: AttendanceRecord) => {
    const existing = acc.find(item => item.userId === record.userId)

    if (existing) {
      if (record.type === 'checkin' && !existing.checkIn) {
        existing.checkIn = record
      } else if (record.type === 'checkout' && !existing.checkOut) {
        existing.checkOut = record
      }

      // Calculate hours if both check-in and check-out exist
      if (existing.checkIn && existing.checkOut) {
        const checkInTime = new Date(existing.checkIn.timestamp).getTime()
        const checkOutTime = new Date(existing.checkOut.timestamp).getTime()
        existing.totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)
      }

      // Determine status
      if (existing.checkIn) {
        const checkInHour = new Date(existing.checkIn.timestamp).getHours()
        existing.status = checkInHour > 9 ? 'late' : 'present'
      }
    } else if (record.user) {
      acc.push({
        userId: record.userId,
        user: record.user,
        checkIn: record.type === 'checkin' ? record : undefined,
        checkOut: record.type === 'checkout' ? record : undefined,
        status: record.type === 'checkin' ?
          (new Date(record.timestamp).getHours() > 9 ? 'late' : 'present') :
          'absent'
      })
    }

    return acc
  }, []) || []

  const filteredData = processedData.filter(item =>
    departmentFilter === 'all' || item.user.department === departmentFilter
  )

  const departments = [...new Set(processedData.map(item => item.user.department).filter(Boolean))]

  const stats = {
    totalEmployees: processedData.length,
    present: processedData.filter(d => d.checkIn).length,
    absent: processedData.filter(d => !d.checkIn).length,
    late: processedData.filter(d => d.status === 'late').length,
    violations: data?.checkins?.filter((r: AttendanceRecord) => r.isViolation).length || 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Timetable</h1>
          <p className="mt-1 text-sm text-gray-500">
            Professional attendance tracking and timesheet management
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode('timetable')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'timetable'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Timetable View
          </button>
          <button
            onClick={() => setViewMode('records')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'records'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Records View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Select Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏢 Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Total Employees</div>
              <div className="text-3xl font-bold mt-2">{stats.totalEmployees}</div>
            </div>
            <div className="text-4xl opacity-50">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Present</div>
              <div className="text-3xl font-bold mt-2">{stats.present}</div>
            </div>
            <div className="text-4xl opacity-50">✓</div>
          </div>
          <div className="text-xs mt-2 opacity-75">
            {((stats.present / stats.totalEmployees) * 100).toFixed(1)}% attendance
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Absent</div>
              <div className="text-3xl font-bold mt-2">{stats.absent}</div>
            </div>
            <div className="text-4xl opacity-50">✗</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Late Arrivals</div>
              <div className="text-3xl font-bold mt-2">{stats.late}</div>
            </div>
            <div className="text-4xl opacity-50">⏰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Violations</div>
              <div className="text-3xl font-bold mt-2">{stats.violations}</div>
            </div>
            <div className="text-4xl opacity-50">⚠️</div>
          </div>
        </div>
      </div>

      {/* Timetable View */}
      {viewMode === 'timetable' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Daily Attendance Timesheet</h2>
            <p className="text-blue-100 text-sm mt-1">
              {new Date(dateFilter).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Employee Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Check-In Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Check-Out Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Verification
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((attendance, index) => (
                  <tr
                    key={attendance.userId}
                    className={`hover:bg-gray-50 transition ${
                      !attendance.checkIn ? 'bg-red-50' :
                      attendance.status === 'late' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {attendance.user.firstName[0]}{attendance.user.lastName[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {attendance.user.firstName} {attendance.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{attendance.user.email}</div>
                          {attendance.user.employeeId && (
                            <div className="text-xs text-gray-400 font-mono">
                              ID: {attendance.user.employeeId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {attendance.user.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.checkIn ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(attendance.checkIn.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(attendance.checkIn.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.checkOut ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(attendance.checkOut.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(attendance.checkOut.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.totalHours ? (
                        <div className="text-sm font-bold text-gray-900">
                          {attendance.totalHours.toFixed(2)} hrs
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!attendance.checkIn ? (
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                          ● Absent
                        </span>
                      ) : attendance.status === 'late' ? (
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">
                          ⏰ Late
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                          ✓ On Time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {attendance.checkIn?.biometricVerified ? (
                          <span className="text-xs text-green-600 font-semibold">✓ Biometric</span>
                        ) : attendance.checkIn ? (
                          <span className="text-xs text-gray-400">Manual</span>
                        ) : null}
                        {attendance.checkIn?.isWithinZone ? (
                          <span className="text-xs text-green-600">📍 In Zone</span>
                        ) : attendance.checkIn ? (
                          <span className="text-xs text-red-600">📍 Out of Zone</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No attendance records found for this date.</p>
              <p className="text-gray-400 text-sm mt-2">Try selecting a different date or department.</p>
            </div>
          )}
        </div>
      )}

      {/* Records View */}
      {viewMode === 'records' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Detailed Attendance Records</h2>
            <p className="text-purple-100 text-sm mt-1">All check-in and check-out events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.checkins?.map((record: AttendanceRecord) => (
                  <tr key={record.id} className={`hover:bg-gray-50 ${record.isViolation ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {record.user?.firstName} {record.user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{record.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                          record.type === 'checkin'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.type === 'checkin' ? '→ Check-in' : '← Check-out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(record.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600 font-mono">
                        {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                      </div>
                      {record.accuracy && (
                        <div className="text-xs text-gray-400">Accuracy: ±{record.accuracy}m</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {record.biometricVerified ? (
                          <div className="text-xs">
                            <span className="text-green-600 font-semibold">✓ Biometric</span>
                            {record.biometricType && (
                              <div className="text-gray-500 capitalize">{record.biometricType}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Manual Entry</span>
                        )}
                        {record.isWithinZone ? (
                          <span className="text-xs text-green-600 block">📍 In Geofence</span>
                        ) : (
                          <span className="text-xs text-red-600 block">📍 Outside Zone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.isViolation ? (
                        <div>
                          <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                            ⚠️ Violation
                          </span>
                          {record.violationReason && (
                            <div className="text-xs text-red-600 mt-2 max-w-xs">
                              {record.violationReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                          ✓ Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data?.checkins || data.checkins.length === 0) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No attendance records found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

