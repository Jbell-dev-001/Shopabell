'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Clock, Star, Archive } from 'lucide-react'
import { ChatWindow } from '@/components/chat/chat-window'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface Chat {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string | null
  last_message_at: string
  status: string
  unread_count_seller: number
  priority: string
  buyer?: {
    name: string
    phone: string
  }
  product?: {
    name: string
    images: any
  }
  last_message?: {
    content: string
    message_type: string
  }
}

export default function ChatsPage() {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchChats()
      subscribeToChats()
    }
  }, [user, filter])

  const fetchChats = async () => {
    try {
      let query = supabase
        .from('chats')
        .select(`
          *,
          buyer:buyers!inner(
            id,
            users!inner(name, phone)
          ),
          product:products(
            name,
            images
          )
        `)
        .eq('seller_id', user?.id)
        .order('last_message_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('status', 'active')
      } else if (filter === 'archived') {
        query = query.eq('status', 'archived')
      }

      const { data, error } = await query

      if (error) throw error

      // Fetch last message for each chat
      const chatsWithLastMessage = await Promise.all(
        (data || []).map(async (chat) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('content, message_type')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...chat,
            buyer: {
              name: chat.buyer?.users?.name || 'Unknown',
              phone: chat.buyer?.users?.phone || ''
            },
            last_message: lastMessage
          }
        })
      )

      setChats(chatsWithLastMessage)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToChats = () => {
    const channel = supabase
      .channel('seller-chats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `seller_id=eq.${user?.id}`
        },
        () => {
          fetchChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (chatId: string) => {
    await supabase
      .from('chats')
      .update({ unread_count_seller: 0 })
      .eq('id', chatId)
  }

  const archiveChat = async (chatId: string) => {
    try {
      await supabase
        .from('chats')
        .update({ status: 'archived' })
        .eq('id', chatId)
      
      await fetchChats()
      setSelectedChat(null)
    } catch (error) {
      console.error('Error archiving chat:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
        <p className="text-gray-600 mt-2">Manage conversations with buyers</p>
      </div>

      <div className="bg-white rounded-lg shadow h-full flex">
        {/* Chat List */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  filter === 'all'
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  filter === 'active'
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  filter === 'archived'
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {chats.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No chats yet
              </div>
            ) : (
              chats.map((chat) => {
                const imageUrl = Array.isArray(chat.product?.images) && chat.product.images.length > 0
                  ? chat.product.images[0]
                  : '/placeholder.png'

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat)
                      markAsRead(chat.id)
                    }}
                    className={cn(
                      "p-4 border-b hover:bg-gray-50 cursor-pointer",
                      selectedChat?.id === chat.id && "bg-indigo-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={imageUrl}
                        alt={chat.product?.name || 'Product'}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {chat.buyer?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.product?.name || 'General inquiry'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500">
                              {format(new Date(chat.last_message_at), 'MMM dd')}
                            </span>
                            {chat.unread_count_seller > 0 && (
                              <span className="mt-1 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                                {chat.unread_count_seller}
                              </span>
                            )}
                          </div>
                        </div>
                        {chat.last_message && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {chat.last_message.message_type === 'order' 
                              ? '🛒 Order created'
                              : chat.last_message.content}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {chat.priority === 'high' && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                          {chat.status === 'order_created' && (
                            <span className="text-xs text-green-600 font-medium">Order Created</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {selectedChat ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedChat.buyer?.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">{selectedChat.buyer?.phone || ''}</p>
                </div>
                <button
                  onClick={() => archiveChat(selectedChat.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Archive className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1">
                <ChatWindow
                  chatId={selectedChat.id}
                  sellerId={selectedChat.seller_id}
                  buyerId={selectedChat.buyer_id}
                  productId={selectedChat.product_id || undefined}
                  productName={selectedChat.product?.name}
                  productImage={Array.isArray(selectedChat.product?.images) ? selectedChat.product.images[0] : undefined}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}