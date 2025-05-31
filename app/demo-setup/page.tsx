'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoSetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  const seedDemoUsers = async () => {
    setStatus('loading')
    setMessage('Creating demo users...')
    
    try {
      const response = await fetch('/api/demo/seed-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStatus('success')
        setMessage(result.message)
        setDetails(result)
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to seed demo users')
        setDetails(result.details)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error occurred')
      setDetails(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ShopAbell Demo Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up demo users for testing the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Demo User Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">This will create demo users in your database:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>3 Sellers (Fashion, Electronics, Food)</li>
                <li>2 Buyers (Test customers)</li>
                <li>1 Admin (Platform management)</li>
              </ul>
            </div>

            <Button
              onClick={seedDemoUsers}
              disabled={status === 'loading'}
              className="w-full"
              size="lg"
            >
              {status === 'loading' ? 'Creating Users...' : 'Set Up Demo Users'}
            </Button>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-medium">✅ {message}</p>
                {details && (
                  <div className="mt-2 text-xs text-green-600">
                    <p>Users: {details.users} | Sellers: {details.sellers} | Buyers: {details.buyers}</p>
                  </div>
                )}
                <div className="mt-3 text-xs text-green-700">
                  <p className="font-medium">Now you can test login with:</p>
                  <p>📱 Seller: +919876543210</p>
                  <p>🛒 Buyer: +919876543220</p>
                  <p>👨‍💼 Admin: +919876543200</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm font-medium">❌ {message}</p>
                {details && (
                  <div className="mt-2 text-xs text-red-600">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="text-center">
                <a
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Go to Login →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}