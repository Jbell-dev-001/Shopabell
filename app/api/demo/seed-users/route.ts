import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Demo users data
    const demoUsers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        phone: '+919876543210',
        name: 'Priya Sharma',
        email: 'priya@shopabell.demo',
        role: 'seller',
        is_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        phone: '+919876543211',
        name: 'Rajesh Kumar',
        email: 'rajesh@shopabell.demo',
        role: 'seller',
        is_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        phone: '+919876543212',
        name: 'Anita Verma',
        email: 'anita@shopabell.demo',
        role: 'seller',
        is_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        phone: '+919876543220',
        name: 'Vikram Singh',
        email: 'vikram@shopabell.demo',
        role: 'buyer',
        is_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        phone: '+919876543221',
        name: 'Meera Patel',
        email: 'meera@shopabell.demo',
        role: 'buyer',
        is_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        phone: '+919876543200',
        name: 'Admin User',
        email: 'admin@shopabell.demo',
        role: 'admin',
        is_verified: true
      }
    ]

    // Insert demo users
    const { error: usersError } = await supabase
      .from('users')
      .upsert(demoUsers, { onConflict: 'phone' })

    if (usersError) {
      console.error('Users insert error:', usersError)
    }

    // Insert demo sellers
    const demoSellers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        business_name: 'Fashion Junction',
        business_category: 'Fashion & Apparel',
        subscription_plan: 'premium',
        is_verified: true,
        store_slug: 'fashion-junction'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        business_name: 'Tech Mart',
        business_category: 'Electronics',
        subscription_plan: 'basic',
        is_verified: true,
        store_slug: 'tech-mart'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        business_name: 'Healthy Bites',
        business_category: 'Food & Beverages',
        subscription_plan: 'free',
        is_verified: true,
        store_slug: 'healthy-bites'
      }
    ]

    const { error: sellersError } = await supabase
      .from('sellers')
      .upsert(demoSellers, { onConflict: 'id' })

    if (sellersError) {
      console.error('Sellers insert error:', sellersError)
    }

    // Insert demo buyers
    const demoBuyers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        delivery_address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        delivery_address: {
          street: '456 Park Ave',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        }
      }
    ]

    const { error: buyersError } = await supabase
      .from('buyers')
      .upsert(demoBuyers, { onConflict: 'id' })

    if (buyersError) {
      console.error('Buyers insert error:', buyersError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo users seeded successfully',
      users: demoUsers.length,
      sellers: demoSellers.length,
      buyers: demoBuyers.length
    })

  } catch (error) {
    console.error('Demo seed error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed demo users',
      details: error
    }, { status: 500 })
  }
}