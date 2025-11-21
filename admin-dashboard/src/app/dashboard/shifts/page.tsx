'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Shift {
  id: string
  name: string
  description?: string
  startTime: string
  endTime: string
  workDays: string[]
  color: string
  isActive: boolean
  allowedLateMinutes: number
  allowedEarlyDepartureMinutes: number
  overtimeMultiplier: number
}

interface UserShiftAssignment {
  id: string
  userId: string
  shiftId: string
  effectiveFrom: string
  effectiveTo?: string
  isActive: boolean
  user: {
    firstName: string
    lastName: string
    email: string
    employeeId?: string
  }
  shift: Shift
}

interface OvertimeRecord {
  id: string
  userId: string
  date: string
  regularHours: number
  overtimeHours: number
  totalHours: number
  overtimeMultiplier: number
  status: 'pending' | 'approved' | 'rejected'
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function ShiftsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'overtime'>('shifts')
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)

  const { data: shifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const response = await api.get('/shifts')
      return response.data.data
    }
  })

  const createShiftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/shifts', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift created successfully!')
      setShowShiftModal(false)
      setEditingShift(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create shift')
    }
  })

  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/shifts/${id}`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift updated successfully!')
      setShowShiftModal(false)
      setEditingShift(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update shift')
    }
  })

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/shifts/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete shift')
    }
  })

  const handleDeleteShift = async (shiftId: string, shiftName: string) => {
    if (confirm(`Are you sure you want to delete "${shiftName}"? This action cannot be undone.`)) {
      deleteShiftMutation.mutate(shiftId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management & Overtime</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage work shifts, assign employees, and track overtime
          </p>
        </div>
        {activeTab === 'shifts' && (
          <button
            onClick={() => setShowShiftModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Create Shift
          </button>
        )}
        {activeTab === 'assignments' && (
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            + Assign Shift
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🕐 Shifts & Timetables
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Employee Assignments
            </button>
            <button
              onClick={() => setActiveTab('overtime')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'overtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⏱️ Overtime Tracking
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Shifts Tab */}
          {activeTab === 'shifts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts?.map((shift: Shift) => (
                  <div
                    key={shift.id}
                    className="border-2 rounded-lg p-6 hover:shadow-lg transition"
                    style={{ borderColor: shift.color }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: shift.color }}
                        />
                        <h3 className="text-lg font-bold text-gray-900">{shift.name}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        shift.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {shift.description && (
                      <p className="text-sm text-gray-600 mb-4">{shift.description}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Time:</span>
                        <span className="font-semibold text-gray-900">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Duration:</span>
                        <span className="font-semibold text-gray-900">
                          {calculateShiftHours(shift.startTime, shift.endTime)} hours
                        </span>
                      </div>

                      <div className="flex items-start text-sm">
                        <span className="text-gray-500 w-24">Work Days:</span>
                        <div className="flex flex-wrap gap-1">
                          {shift.workDays.map((day) => (
                            <span
                              key={day}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {day.substring(0, 3).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Late Grace:</span>
                          <span className="font-medium">{shift.allowedLateMinutes} min</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Early Leave:</span>
                          <span className="font-medium">{shift.allowedEarlyDepartureMinutes} min</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">OT Multiplier:</span>
                          <span className="font-medium">{shift.overtimeMultiplier}x</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingShift(shift)
                          setShowShiftModal(true)
                        }}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id, shift.name)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(!shifts || shifts.length === 0) && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🕐</div>
                  <p className="text-gray-500 text-lg">No shifts created yet</p>
                  <button
                    onClick={() => setShowShiftModal(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Shift
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <AssignmentsView />
          )}

          {/* Overtime Tab */}
          {activeTab === 'overtime' && (
            <OvertimeView />
          )}
        </div>
      </div>

      {/* Shift Creation/Edit Modal */}
      {showShiftModal && (
        <ShiftModal
          shift={editingShift}
          onClose={() => {
            setShowShiftModal(false)
            setEditingShift(null)
          }}
        />
      )}
    </div>
  )
}

function calculateShiftHours(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)

  let hours = endH - startH
  let minutes = endM - startM

  if (hours < 0) hours += 24 // Handle overnight shifts

  return hours + (minutes / 60)
}

function ShiftModal({ shift, onClose }: { shift: Shift | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: shift?.name || '',
    description: shift?.description || '',
    startTime: shift?.startTime || '09:00',
    endTime: shift?.endTime || '17:00',
    workDays: shift?.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    color: shift?.color || '#3B82F6',
    allowedLateMinutes: shift?.allowedLateMinutes || 15,
    allowedEarlyDepartureMinutes: shift?.allowedEarlyDepartureMinutes || 15,
    overtimeMultiplier: shift?.overtimeMultiplier || 1.5
  })

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const toggleWorkDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }))
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/shifts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift created successfully!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create shift')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await api.put(`/shifts/${shift?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift updated successfully!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update shift')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (shift) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {shift ? 'Edit Shift' : 'Create New Shift'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shift Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Morning Shift"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={2}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Work Days *
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkDay(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      formData.workDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.substring(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shift Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Overtime Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={formData.overtimeMultiplier}
                onChange={(e) => setFormData({ ...formData, overtimeMultiplier: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Late Grace Period (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.allowedLateMinutes}
                onChange={(e) => setFormData({ ...formData, allowedLateMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Early Leave Grace (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.allowedEarlyDepartureMinutes}
                onChange={(e) => setFormData({ ...formData, allowedEarlyDepartureMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {shift ? 'Update Shift' : 'Create Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AssignmentsView() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">👥</div>
      <p className="text-gray-500 text-lg">Shift assignments feature</p>
      <p className="text-gray-400 text-sm mt-2">Assign employees to shifts and manage their schedules</p>
    </div>
  )
}

function OvertimeView() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">⏱️</div>
      <p className="text-gray-500 text-lg">Overtime tracking feature</p>
      <p className="text-gray-400 text-sm mt-2">Track and approve employee overtime hours</p>
    </div>
  )
}
