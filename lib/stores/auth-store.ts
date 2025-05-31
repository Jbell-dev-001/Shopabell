import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  phone: string
  name: string | null
  email: string | null
  role: 'seller' | 'buyer' | 'admin' | 'group_admin'
  languagePreference: string
  profileImage: string | null
  isVerified: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  phoneNumber: string | null
  verificationStep: 'phone' | 'otp' | 'profile' | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setPhoneNumber: (phone: string) => void
  setVerificationStep: (step: 'phone' | 'otp' | 'profile' | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      phoneNumber: null,
      verificationStep: null,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        verificationStep: null 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      
      setVerificationStep: (verificationStep) => set({ verificationStep }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        phoneNumber: null,
        verificationStep: null 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)