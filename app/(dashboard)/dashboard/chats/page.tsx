'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Info, ShoppingBag } from 'lucide-react'
import { ChatWindow } from '@/components/chat/chat-window'
import { ChatList } from '@/components/chat/chat-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ChatsPage() {
  const { user } = useAuthStore()
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [stats, setStats] = useState({
    totalChats: 0,
    unreadCount: 0,
    ordersCreated: 0
  })
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const isSeller = user?.role === 'seller'
      const column = isSeller ? 'seller_id' : 'buyer_id'
      const unreadColumn = isSeller ? 'unread_count_seller' : 'unread_count_buyer'

      // Fetch chat stats
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .eq(column, user?.id)

      if (error) throw error

      const totalChats = chats?.length || 0
      const unreadCount = chats?.reduce((sum, chat) => sum + chat[unreadColumn], 0) || 0
      const ordersCreated = chats?.filter(chat => chat.status === 'order_created').length || 0

      setStats({
        totalChats,
        unreadCount,
        ordersCreated
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const markAsRead = async (chatId: string) => {
    const isSeller = user?.role === 'seller'
    const column = isSeller ? 'unread_count_seller' : 'unread_count_buyer'
    
    await supabase
      .from('chats')
      .update({ [column]: 0 })
      .eq('id', chatId)
    
    fetchStats()
  }

  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat)
    markAsRead(chat.id)
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
          <p className="text-gray-600 mt-2">
            Manage conversations with {user?.role === 'seller' ? 'buyers' : 'sellers'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
            <p className="text-sm text-gray-600">Total Chats</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.unreadCount}</p>
            <p className="text-sm text-gray-600">Unread</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.ordersCreated}</p>
            <p className="text-sm text-gray-600">Orders</p>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-lg shadow h-full flex">
        {/* Chat List */}
        <div className="w-1/3 border-r">
          <ChatList
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat.id}
              sellerId={selectedChat.seller_id}
              buyerId={selectedChat.buyer_id}
              productId={selectedChat.product_id}
              productName={selectedChat.product?.name}
              productImage={selectedChat.product?.images?.[0]}
              productPrice={selectedChat.product?.price}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a chat to start messaging</p>
                <p className="text-sm mt-2">
                  {user?.role === 'seller' 
                    ? "Use the 'sell' command to create instant orders"
                    : "Chat with sellers about products"}
                </p>
                
                {user?.role === 'seller' && (
                  <div className="mt-8 bg-blue-50 rounded-lg p-6 max-w-md mx-auto text-left">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      How to use the 'sell' command
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>• Type "sell 599" to create a ₹599 order</p>
                      <p>• Add quantity: "sell 599 x2" for 2 items</p>
                      <p>• Add discount: "sell 599 10% off"</p>
                      <p>• Specify variants: "sell 599 red medium"</p>
                      <p>• Payment method: "sell 599 cod"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}