'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Package, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseSellCommand, generateOrderFromCommand } from '@/lib/chat/sell-command-parser'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: 'text' | 'product' | 'order' | 'system'
  created_at: string
  metadata?: any
}

interface ChatWindowProps {
  chatId?: string
  sellerId: string
  buyerId: string
  productId?: string
  productName?: string
  productImage?: string
  productPrice?: number
  onClose?: () => void
}

export function ChatWindow({ 
  chatId: initialChatId, 
  sellerId, 
  buyerId, 
  productId,
  productName,
  productImage,
  productPrice,
  onClose 
}: ChatWindowProps) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState(initialChatId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  const isSeller = user?.id === sellerId
  const currentUserId = user?.id
  
  useEffect(() => {
    if (chatId) {
      fetchMessages()
      subscribeToMessages()
    } else if (productId) {
      createNewChat()
    }
  }, [chatId, productId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }
  
  const createNewChat = async () => {
    try {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          chat_type: 'product_inquiry',
          last_message_by: buyerId
        })
        .select()
        .single()
      
      if (error) throw error
      setChatId(newChat.id)
      
      // Send initial product message
      if (productId && productName) {
        const productMessage = {
          chat_id: newChat.id,
          sender_id: buyerId,
          message_type: 'product' as const,
          content: `Interested in ${productName}`,
          metadata: {
            product_id: productId,
            product_name: productName,
            product_image: productImage,
            product_price: productPrice
          }
        }
        
        const { data: message } = await supabase
          .from('chat_messages')
          .insert(productMessage)
          .select()
          .single()
        
        if (message) {
          setMessages([message])
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Failed to start chat')
    }
  }
  
  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatId || !currentUserId) return
    
    setIsLoading(true)
    
    try {
      // Check if it's a sell command (only for sellers)
      if (isSeller && newMessage.toLowerCase().startsWith('sell ')) {
        const command = parseSellCommand(newMessage)
        
        if (command.isValid && command.price) {
          // Get the product from the last product message
          const lastProductMessage = messages
            .filter(m => m.message_type === 'product')
            .pop()
          
          const productIdToUse = lastProductMessage?.metadata?.product_id || productId
          
          if (!productIdToUse) {
            toast.error('No product selected for this order')
            setIsLoading(false)
            return
          }
          
          // Generate order details
          const orderData = generateOrderFromCommand(
            command,
            productIdToUse,
            buyerId,
            sellerId
          )
          
          // Send sell command message
          const { data: commandMessage } = await supabase
            .from('chat_messages')
            .insert({
              chat_id: chatId,
              sender_id: currentUserId,
              message_type: 'order',
              content: newMessage,
              metadata: {
                command,
                order_preview: orderData,
                status: 'pending'
              }
            })
            .select()
            .single()
          
          if (commandMessage) {
            setMessages(prev => [...prev, commandMessage])
          }
          
          // Send system message
          const systemMessage = {
            chat_id: chatId,
            sender_id: currentUserId,
            message_type: 'system' as const,
            content: `Order created: ${command.quantity || 1} item(s) for ₹${command.price} each. Total: ₹${orderData.total_amount}. Buyer can now proceed to checkout.`
          }
          
          await supabase
            .from('chat_messages')
            .insert(systemMessage)
          
          toast.success('Order created! Buyer can now checkout.')
        } else {
          toast.error(command.error || 'Invalid sell command')
        }
      } else {
        // Regular text message
        const { data: message, error } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            sender_id: currentUserId,
            message_type: 'text',
            content: newMessage
          })
          .select()
          .single()
        
        if (error) throw error
        if (message) {
          setMessages(prev => [...prev, message])
        }
      }
      
      // Update chat last message
      await supabase
        .from('chats')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_by: currentUserId
        })
        .eq('id', chatId)
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCheckout = async (metadata: any) => {
    try {
      const orderData = metadata.order_preview
      
      // Create actual order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          order_number: `ORD${Date.now().toString(36).toUpperCase()}`,
          shipping_address: {
            address: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            pincode: '000000'
          },
          payment_status: 'pending',
          order_status: 'pending'
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Update chat status
      await supabase
        .from('chats')
        .update({ status: 'order_created' })
        .eq('id', chatId)
      
      toast.success('Order created! Redirecting to checkout...')
      
      // Redirect to checkout
      window.location.href = `/checkout?orderId=${order.id}`
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
    }
  }
  
  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold">
              {isSeller ? 'Chat with Buyer' : 'Chat with Seller'}
            </h3>
            {productName && (
              <p className="text-sm text-gray-600">{productName}</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId
          
          if (message.message_type === 'product') {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={message.metadata?.product_image || '/placeholder.png'}
                      alt={message.metadata?.product_name || 'Product'}
                      width={60}
                      height={60}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">{message.metadata?.product_name}</p>
                      <p className="text-lg font-bold">₹{message.metadata?.product_price}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          if (message.message_type === 'system') {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-blue-50 text-blue-800 rounded-lg px-3 py-2 text-sm">
                  {message.content}
                </div>
              </div>
            )
          }
          
          if (message.message_type === 'order') {
            const command = message.metadata?.command
            const orderPreview = message.metadata?.order_preview
            
            return (
              <div key={message.id} className={cn(
                "flex",
                isOwn ? "justify-end" : "justify-start"
              )}>
                <div className="bg-indigo-50 rounded-lg p-4 max-w-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-900">Order Created</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Quantity: {command?.quantity || 1}</p>
                    <p>Price: ₹{command?.price} each</p>
                    {command?.discount && (
                      <p>Discount: {command.discount.type === 'percentage' 
                        ? `${command.discount.value}%` 
                        : `₹${command.discount.value}`} off</p>
                    )}
                    <p className="font-bold">Total: ₹{orderPreview?.total_amount}</p>
                  </div>
                  {!isOwn && message.metadata?.status === 'pending' && (
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleCheckout(message.metadata)}
                    >
                      Proceed to Checkout
                    </Button>
                  )}
                </div>
              </div>
            )
          }
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex",
                isOwn ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs px-4 py-2 rounded-lg",
                  isOwn
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className={cn(
                  "text-xs mt-1",
                  isOwn ? "text-indigo-200" : "text-gray-500"
                )}>
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isSeller ? "Type 'sell 599' to create order..." : "Type a message..."}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isSeller && (
          <p className="text-xs text-gray-500 mt-2">
            Tip: Use "sell [price]" to create an order (e.g., "sell 599")
          </p>
        )}
      </form>
    </div>
  )
}