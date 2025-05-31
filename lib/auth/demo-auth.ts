import { User } from '@/types/supabase';

// Demo user credentials and data
export const DEMO_USERS = {
  '+919876543210': {
    id: 'demo-seller-1',
    phone: '+919876543210',
    name: 'Priya Sharma',
    role: 'seller' as const,
    email: 'priya.sharma@demo.shopabell.com',
    business_name: 'Priya\'s Boutique',
    business_address: '123 Fashion Street, Mumbai',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '+919876543211': {
    id: 'demo-seller-2',
    phone: '+919876543211',
    name: 'Rajesh Kumar',
    role: 'seller' as const,
    email: 'rajesh.kumar@demo.shopabell.com',
    business_name: 'Kumar Electronics',
    business_address: '456 Tech Plaza, Delhi',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '+919876543212': {
    id: 'demo-seller-3',
    phone: '+919876543212',
    name: 'Anita Verma',
    role: 'seller' as const,
    email: 'anita.verma@demo.shopabell.com',
    business_name: 'Verma Handicrafts',
    business_address: '789 Craft Lane, Jaipur',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '+919876543220': {
    id: 'demo-buyer-1',
    phone: '+919876543220',
    name: 'Vikram Singh',
    role: 'buyer' as const,
    email: 'vikram.singh@demo.shopabell.com',
    business_name: null,
    business_address: null,
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '+919876543221': {
    id: 'demo-buyer-2',
    phone: '+919876543221',
    name: 'Meera Patel',
    role: 'buyer' as const,
    email: 'meera.patel@demo.shopabell.com',
    business_name: null,
    business_address: null,
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '+919876543200': {
    id: 'demo-admin-1',
    phone: '+919876543200',
    name: 'Admin User',
    role: 'admin' as const,
    email: 'admin@demo.shopabell.com',
    business_name: 'Shopabell Admin',
    business_address: 'Shopabell HQ',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
} as const;

// Type for demo user phone numbers
export type DemoPhoneNumber = keyof typeof DEMO_USERS;

/**
 * Check if a phone number belongs to a demo account
 */
export function isDemoAccount(phone: string): boolean {
  return phone in DEMO_USERS;
}

/**
 * Get demo user data by phone number
 */
export function getDemoUser(phone: string): User | null {
  if (!isDemoAccount(phone)) {
    return null;
  }
  
  return DEMO_USERS[phone as DemoPhoneNumber] as User;
}

/**
 * Authenticate a demo user without Supabase
 * Returns user data if authentication succeeds, null otherwise
 */
export function authenticateDemoUser(phone: string, otp?: string): User | null {
  // For demo accounts, we don't validate OTP
  // Just check if the phone number is a demo account
  if (!isDemoAccount(phone)) {
    return null;
  }
  
  return getDemoUser(phone);
}

/**
 * Get all demo users
 */
export function getAllDemoUsers(): User[] {
  return Object.values(DEMO_USERS) as User[];
}

/**
 * Get demo users by role
 */
export function getDemoUsersByRole(role: 'seller' | 'buyer' | 'admin'): User[] {
  return getAllDemoUsers().filter(user => user.role === role);
}

/**
 * Generate a demo session token for a user
 * In a real implementation, this would be a JWT or similar
 */
export function generateDemoSessionToken(userId: string): string {
  // Simple demo token - in production this would be a proper JWT
  return `demo-session-${userId}-${Date.now()}`;
}

/**
 * Validate a demo session token
 */
export function validateDemoSessionToken(token: string): boolean {
  // Simple validation for demo - just check format
  return token.startsWith('demo-session-');
}

/**
 * Extract user ID from demo session token
 */
export function getUserIdFromDemoToken(token: string): string | null {
  if (!validateDemoSessionToken(token)) {
    return null;
  }
  
  const parts = token.split('-');
  if (parts.length >= 3) {
    return `${parts[2]}-${parts[3]}-${parts[4]}`;
  }
  
  return null;
}