'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatWindow } from './chat-window'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ChatButtonProps {
  sellerId: string
  productId?: string
  productName?: string
  productImage?: string
  productPrice?: number
}

export function ChatButton({ 
  sellerId, 
  productId,
  productName,
  productImage,
  productPrice
}: ChatButtonProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [showChat, setShowChat] = useState(false)
  
  const handleChatClick = () => {
    if (!user) {
      toast.info('Please login to chat with seller')
      router.push('/login')
      return
    }
    
    if (user.id === sellerId) {
      toast.error('You cannot chat with yourself')
      return
    }
    
    setShowChat(true)
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleChatClick}
        className="flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Chat
      </Button>
      
      {showChat && user && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWindow
            sellerId={sellerId}
            buyerId={user.id}
            productId={productId}
            productName={productName}
            productImage={productImage}
            productPrice={productPrice}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </>
  )
}