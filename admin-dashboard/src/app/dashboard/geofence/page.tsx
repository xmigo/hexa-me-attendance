'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface WorkZone {
  id: string
  name: string
  description?: string
  zoneType: 'circle' | 'polygon'
  centerLat?: number
  centerLng?: number
  radius?: number
  coordinates?: string
  isRestricted: boolean
  department?: string
  bufferDistance: number
  isActive: boolean
}

export default function GeofencePage() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingZone, setEditingZone] = useState<WorkZone | null>(null)

  const { data: zones, isLoading } = useQuery<{ zones: WorkZone[] }>({
    queryKey: ['geofence-zones'],
    queryFn: async () => {
      const response = await api.get('/geofence')
      return response.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      await api.delete(`/geofence/${zoneId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofence-zones'] })
      toast.success('Work zone deleted successfully')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ zoneId, isActive }: { zoneId: string; isActive: boolean }) => {
      await api.put(`/geofence/${zoneId}`, { isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofence-zones'] })
      toast.success('Zone status updated')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Zone Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage geofenced work areas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {zones?.zones?.map((zone) => (
          <div
            key={zone.id}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              zone.isRestricted ? 'border-red-500' : 'border-green-500'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                {zone.description && (
                  <p className="text-sm text-gray-500 mt-1">{zone.description}</p>
                )}
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  zone.isRestricted
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {zone.isRestricted ? 'Restricted' : 'Allowed'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Type:</span>
                <span className="font-medium capitalize text-black">{zone.zoneType}</span>
              </div>
              {zone.zoneType === 'circle' && zone.centerLat && zone.centerLng && (
                <>
                  <div className="flex justify-between">
                    <span className="text-black">Center:</span>
                    <span className="font-medium text-black">
                      {parseFloat(zone.centerLat.toString()).toFixed(6)}, {parseFloat(zone.centerLng.toString()).toFixed(6)}
                    </span>
                  </div>
                  {zone.radius && (
                    <div className="flex justify-between">
                      <span className="text-black">Radius:</span>
                      <span className="font-medium text-black">{zone.radius}m</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <span className="text-black">Buffer:</span>
                <span className="font-medium text-black">{zone.bufferDistance}m</span>
              </div>
              {zone.department && (
                <div className="flex justify-between">
                  <span className="text-black">Department:</span>
                  <span className="font-medium text-black">{zone.department}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-black">Status:</span>
                <span
                  className={`font-medium ${
                    zone.isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {zone.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setEditingZone(zone)}
                className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  toggleActiveMutation.mutate({ zoneId: zone.id, isActive: !zone.isActive })
                }
                className="flex-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition"
              >
                {zone.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete zone "${zone.name}"?`)) {
                    deleteMutation.mutate(zone.id)
                  }
                }}
                className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {zones?.zones?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No work zones created yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Zone
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingZone) && (
        <ZoneModal
          zone={editingZone}
          onClose={() => {
            setShowCreateModal(false)
            setEditingZone(null)
          }}
        />
      )}
    </div>
  )
}

function ZoneModal({ zone, onClose }: { zone: WorkZone | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    description: zone?.description || '',
    zoneType: (zone?.zoneType || 'circle') as 'circle' | 'polygon',
    centerLat: zone?.centerLat?.toString() || '',
    centerLng: zone?.centerLng?.toString() || '',
    radius: zone?.radius?.toString() || '',
    isRestricted: zone?.isRestricted || false,
    department: zone?.department || '',
    bufferDistance: zone?.bufferDistance?.toString() || '50',
    isActive: zone?.isActive ?? true,
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/geofence', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofence-zones'] })
      toast.success('Work zone created successfully')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create zone')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put(`/geofence/${zone?.id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofence-zones'] })
      toast.success('Work zone updated successfully')
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = {
      name: formData.name,
      description: formData.description,
      zoneType: formData.zoneType,
      isRestricted: formData.isRestricted,
      department: formData.department || undefined,
      bufferDistance: parseInt(formData.bufferDistance),
      isActive: formData.isActive,
    }

    if (formData.zoneType === 'circle') {
      if (!formData.centerLat || !formData.centerLng || !formData.radius) {
        toast.error('Center coordinates and radius are required for circle zones')
        return
      }
      data.centerLat = parseFloat(formData.centerLat)
      data.centerLng = parseFloat(formData.centerLng)
      data.radius = parseInt(formData.radius)
    } else {
      toast.error('Polygon zones require map interface (to be implemented)')
      return
    }

    if (zone) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-black mb-4">
            {zone ? 'Edit Work Zone' : 'Create New Work Zone'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Zone Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                placeholder="Main Office"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Zone Type *</label>
              <select
                value={formData.zoneType}
                onChange={(e) =>
                  setFormData({ ...formData, zoneType: e.target.value as 'circle' | 'polygon' })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              >
                <option value="circle">Circle</option>
                <option value="polygon">Polygon (Map interface coming soon)</option>
              </select>
            </div>

            {formData.zoneType === 'circle' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.centerLat}
                      onChange={(e) => setFormData({ ...formData, centerLat: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.centerLng}
                      onChange={(e) => setFormData({ ...formData, centerLng: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                      placeholder="-74.0060"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Radius (meters) *</label>
                  <input
                    type="number"
                    required
                    value={formData.radius}
                    onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                    placeholder="100"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-black">Buffer Distance (meters)</label>
              <input
                type="number"
                value={formData.bufferDistance}
                onChange={(e) => setFormData({ ...formData, bufferDistance: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                placeholder="50"
              />
              <p className="mt-1 text-xs text-black">
                Allowed distance outside zone boundary for check-in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Department (optional)</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                placeholder="IT, Sales, etc."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRestricted"
                checked={formData.isRestricted}
                onChange={(e) => setFormData({ ...formData, isRestricted: e.target.checked })}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isRestricted" className="ml-2 block text-sm text-black">
                Mark as Restricted Zone (Red Zone - check-in NOT allowed)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-black">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {zone ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


