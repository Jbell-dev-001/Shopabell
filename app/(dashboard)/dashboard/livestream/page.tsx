'use client'

import { useState, useEffect } from 'react'
import { Video, Plus, Eye, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CaptureWidget } from '@/components/livestream/capture-widget'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface LiveSession {
  id: string
  session_name: string
  start_time: string
  end_time: string | null
  status: string
  total_products_captured: number
  total_revenue: number
  created_at: string
}

export default function LivestreamPage() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [showWidget, setShowWidget] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading livestream data...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Selling</h1>
          <p className="text-gray-600 mt-2">
            Capture products from your livestreams automatically
          </p>
        </div>
        <Button 
          onClick={() => setShowWidget(!showWidget)}
          className="flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          {showWidget ? 'Hide Capture' : 'Start Capturing'}
        </Button>
      </div>

      {/* Capture Widget */}
      {showWidget && (
        <div className="mb-8">
          <CaptureWidget />
        </div>
      )}

      {/* Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
            <Video className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products Captured</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.reduce((sum, session) => sum + session.total_products_captured, 0)}
              </p>
            </div>
            <Plus className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue from Live</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{sessions.reduce((sum, session) => sum + session.total_revenue, 0).toLocaleString()}
              </p>
            </div>
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No livestream sessions yet</p>
              <Button 
                onClick={() => setShowWidget(true)}
                className="flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Start Your First Session
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => {
                  const duration = session.end_time 
                    ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)
                    : 'Ongoing'

                  return (
                    <tr key={session.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {session.session_name || 'Untitled Session'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(session.start_time), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof duration === 'number' ? `${duration} min` : duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.total_products_captured}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{session.total_revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'recording'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Getting Started Guide */}
      {sessions.length === 0 && !showWidget && (
        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">
            🎥 Transform Your Live Streams into Products
          </h3>
          <div className="space-y-3 text-sm text-indigo-800">
            <p>• Start a livestream on Facebook, Instagram, or YouTube</p>
            <p>• Use our capture widget to automatically screenshot products</p>
            <p>• AI processes images and creates your product catalog</p>
            <p>• Customers can buy products they saw in your live stream</p>
          </div>
          <Button 
            onClick={() => setShowWidget(true)}
            className="mt-4"
          >
            Try it Now
          </Button>
        </div>
      )}
    </div>
  )
}