'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Package, Clock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { format, formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface Chat {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string | null
  order_id: string | null
  chat_type: string
  last_message_at: string
  status: string
  unread_count_buyer: number
  unread_count_seller: number
  buyer: {
    name: string
    phone: string
    profile_image?: string
  }
  seller: {
    business_name: string
    profile_image?: string
  }
  product?: {
    name: string
    images: string[]
    price: number
  }
  messages: any[]
}

interface ChatListProps {
  onChatSelect: (chat: Chat) => void
  selectedChatId?: string
}

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  const isSeller = user?.role === 'seller'

  useEffect(() => {
    if (user?.id) {
      fetchChats()
      subscribeToChats()
    }
  }, [user])

  useEffect(() => {
    filterChats()
  }, [searchQuery, chats])

  const fetchChats = async () => {
    try {
      const column = isSeller ? 'seller_id' : 'buyer_id'
      
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          buyer:buyers!buyer_id(
            id,
            users:users!id(name, phone, profile_image)
          ),
          seller:sellers!seller_id(
            business_name,
            users:users!id(profile_image)
          ),
          product:products(
            name,
            images,
            price
          ),
          messages:chat_messages(
            content,
            created_at,
            message_type,
            sender_id
          )
        `)
        .eq(column, user?.id)
        .order('last_message_at', { ascending: false })
        .limit(5, { foreignTable: 'messages' })

      if (error) throw error

      // Format the data
      const formattedChats = (data || []).map(chat => ({
        ...chat,
        buyer: {
          name: chat.buyer?.users?.name || 'Unknown Buyer',
          phone: chat.buyer?.users?.phone || '',
          profile_image: chat.buyer?.users?.profile_image
        },
        seller: {
          business_name: chat.seller?.business_name || 'Unknown Seller',
          profile_image: chat.seller?.users?.profile_image
        },
        messages: chat.messages || []
      }))

      setChats(formattedChats)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToChats = () => {
    const column = isSeller ? 'seller_id' : 'buyer_id'
    
    const channel = supabase
      .channel('chats-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `${column}=eq.${user?.id}`
        },
        () => {
          fetchChats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
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

  const filterChats = () => {
    if (!searchQuery) {
      setFilteredChats(chats)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = chats.filter(chat => {
      const otherParty = isSeller ? chat.buyer.name : chat.seller.business_name
      const productName = chat.product?.name || ''
      const lastMessage = chat.messages[0]?.content || ''
      
      return (
        otherParty.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query) ||
        lastMessage.toLowerCase().includes(query)
      )
    })

    setFilteredChats(filtered)
  }

  const getUnreadCount = (chat: Chat) => {
    return isSeller ? chat.unread_count_seller : chat.unread_count_buyer
  }

  const getLastMessage = (chat: Chat) => {
    const lastMessage = chat.messages[0]
    if (!lastMessage) return 'No messages yet'
    
    if (lastMessage.message_type === 'product') {
      return '📦 Product inquiry'
    } else if (lastMessage.message_type === 'order') {
      return '🛒 Order created'
    } else if (lastMessage.message_type === 'system') {
      return `ℹ️ ${lastMessage.content}`
    }
    
    const isOwn = lastMessage.sender_id === user?.id
    return `${isOwn ? 'You: ' : ''}${lastMessage.content}`
  }

  const getChatTitle = (chat: Chat) => {
    if (isSeller) {
      return chat.buyer.name
    } else {
      return chat.seller.business_name
    }
  }

  const getChatSubtitle = (chat: Chat) => {
    if (chat.product) {
      return chat.product.name
    }
    return isSeller ? chat.buyer.phone : 'General inquiry'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm">No chats found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats.map((chat) => {
              const unreadCount = getUnreadCount(chat)
              const isSelected = chat.id === selectedChatId
              
              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={cn(
                    "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                    isSelected && "bg-indigo-50 hover:bg-indigo-50"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {chat.product?.images?.[0] ? (
                        <Image
                          src={chat.product.images[0]}
                          alt={chat.product.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {getChatTitle(chat)}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 truncate mb-1">
                        {getChatSubtitle(chat)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {getLastMessage(chat)}
                        </p>
                        {unreadCount > 0 && (
                          <Badge className="ml-2 bg-indigo-600">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mt-2">
                        {chat.status === 'order_created' && (
                          <Badge variant="outline" className="text-xs">
                            Order Created
                          </Badge>
                        )}
                        {chat.chat_type === 'product_inquiry' && (
                          <Badge variant="outline" className="text-xs">
                            Product Inquiry
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}