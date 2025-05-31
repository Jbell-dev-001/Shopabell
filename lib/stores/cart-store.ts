import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  productId: string
  sellerId: string
  name: string
  price: number
  image: string
  quantity: number
  maxQuantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getCartBySeller: () => Record<string, CartItem[]>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId)
        
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), i.maxQuantity) }
                : i
            )
          }
        }
        
        return {
          items: [...state.items, { ...item, quantity: item.quantity || 1 }]
        }
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId
            ? { ...i, quantity: Math.min(Math.max(1, quantity), i.maxQuantity) }
            : i
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getCartBySeller: () => {
        const { items } = get()
        return items.reduce((acc, item) => {
          if (!acc[item.sellerId]) {
            acc[item.sellerId] = []
          }
          acc[item.sellerId].push(item)
          return acc
        }, {} as Record<string, CartItem[]>)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)