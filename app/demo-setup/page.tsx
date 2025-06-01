'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function DemoSetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [fashionStatus, setFashionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [fashionMessage, setFashionMessage] = useState('')
  const [details, setDetails] = useState<any>(null)
  const [fashionDetails, setFashionDetails] = useState<any>(null)

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

  const seedFashionJewelryData = async () => {
    setFashionStatus('loading')
    setFashionMessage('Creating fashion & jewelry demo data...')
    
    try {
      // First try to clear existing data
      setFashionMessage('Clearing existing demo data...')
      await fetch('/api/demo/seed-fashion-jewelry', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Now create fresh data
      setFashionMessage('Creating fashion & jewelry demo data...')
      const response = await fetch('/api/demo/seed-fashion-jewelry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setFashionStatus('success')
        setFashionMessage(result.message)
        setFashionDetails(result.credentials)
        toast.success('Fashion & jewelry demo data created successfully!')
      } else {
        setFashionStatus('error')
        setFashionMessage(result.error || 'Failed to seed fashion & jewelry data')
        setFashionDetails(result.details)
        toast.error(result.error || 'Failed to seed fashion & jewelry data')
      }
    } catch (error) {
      setFashionStatus('error')
      setFashionMessage('Network error occurred')
      setFashionDetails(error)
      toast.error('Network error occurred')
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center">Fashion & Jewelry Demo Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Create Indian fashion & jewelry sellers:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>3 Fashion Sellers (Sarees, Lehengas, Kurtis)</li>
                <li>3 Jewelry Sellers (Gold, Diamond, Traditional)</li>
                <li>1 Mixed Fashion & Jewelry Seller</li>
                <li>Sample products with Indian designs</li>
                <li>3 Demo buyers with purchase history</li>
              </ul>
            </div>

            <Button
              onClick={seedFashionJewelryData}
              disabled={fashionStatus === 'loading'}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {fashionStatus === 'loading' ? 'Creating Data...' : 'Set Up Fashion & Jewelry Demo'}
            </Button>

            {fashionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-medium">✅ {fashionMessage}</p>
                {fashionDetails && (
                  <div className="mt-3 text-xs text-green-700 space-y-2">
                    <div>
                      <p className="font-medium mb-1">Fashion Sellers:</p>
                      <p>👗 Priya Fashion House: priya@shopabell.demo</p>
                      <p>👘 Ananya Boutique: ananya@shopabell.demo</p>
                      <p>🥻 Kavya Ethnic Wear: kavya@shopabell.demo</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Jewelry Sellers:</p>
                      <p>💎 Lakshmi Jewellers: lakshmi@shopabell.demo</p>
                      <p>💍 Royal Gems: royal@shopabell.demo</p>
                      <p>📿 Sona Jewels: sona@shopabell.demo</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Mixed Store:</p>
                      <p>✨ Meera Collections: meera@shopabell.demo</p>
                    </div>
                    <p className="font-medium mt-2">Password for all: Demo123!</p>
                  </div>
                )}
              </div>
            )}

            {fashionStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm font-medium">❌ {fashionMessage}</p>
                {fashionDetails && (
                  <div className="mt-2 text-xs text-red-600">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(fashionDetails, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center">Sample Chats & Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Create realistic chat conversations and orders:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Active chat conversation about a saree</li>
                <li>Completed order via "sell" command for jewelry</li>
                <li>Demonstrates full chat-to-order workflow</li>
                <li>Shows seller sell command in action</li>
              </ul>
            </div>

            <Button
              onClick={async () => {
                try {
                  toast.info('Creating sample chats and orders...')
                  const response = await fetch('/api/demo/create-sample-chats', { method: 'POST' })
                  const result = await response.json()
                  if (response.ok) {
                    toast.success(`Sample chats created successfully! ${result.data?.chatsCreated || 0} chats, ${result.data?.messagesCreated || 0} messages`)
                  } else {
                    toast.error(result.error || 'Failed to create sample chats')
                  }
                } catch (error) {
                  toast.error('Network error while creating sample chats')
                }
              }}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Create Sample Chats & Orders
            </Button>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Make sure to set up Fashion & Jewelry demo data first, 
                then create sample chats to see the full conversation flow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}