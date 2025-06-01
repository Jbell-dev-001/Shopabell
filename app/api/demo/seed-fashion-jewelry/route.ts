import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if demo data already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'priya@shopabell.demo')
      .single()
    
    if (existingUser) {
      return NextResponse.json({ 
        message: 'Demo data already exists' 
      }, { status: 400 })
    }

    // Hash password for all demo accounts
    const hashedPassword = await hash('Demo123!', 10)
    
    // Create demo users
    const demoUsers = [
      // Fashion Sellers
      {
        id: '11111111-1111-1111-1111-111111111111',
        phone: '+919876543210',
        name: 'Priya Fashion House',
        email: 'priya@shopabell.demo',
        role: 'seller',
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        phone: '+919876543211',
        name: 'Ananya Boutique',
        email: 'ananya@shopabell.demo',
        role: 'seller',
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        phone: '+919876543212',
        name: 'Kavya Ethnic Wear',
        email: 'kavya@shopabell.demo',
        role: 'seller',
        language_preference: 'hi',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      // Jewelry Sellers
      {
        id: '44444444-4444-4444-4444-444444444444',
        phone: '+919876543213',
        name: 'Lakshmi Jewellers',
        email: 'lakshmi@shopabell.demo',
        role: 'seller',
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        phone: '+919876543214',
        name: 'Royal Gems',
        email: 'royal@shopabell.demo',
        role: 'seller',
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        phone: '+919876543215',
        name: 'Sona Jewels',
        email: 'sona@shopabell.demo',
        role: 'seller',
        language_preference: 'hi',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      // Mixed Fashion & Jewelry
      {
        id: '77777777-7777-7777-7777-777777777777',
        phone: '+919876543216',
        name: 'Meera Collections',
        email: 'meera@shopabell.demo',
        role: 'seller',
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      // Demo Buyers
      {
        id: 'b1111111-1111-1111-1111-111111111111',
        phone: '+919988776655',
        name: 'Rahul Kumar',
        email: 'rahul@demo.com',
        role: 'buyer',
        is_verified: true
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        phone: '+919988776656',
        name: 'Sneha Sharma',
        email: 'sneha@demo.com',
        role: 'buyer',
        is_verified: true
      },
      {
        id: 'b3333333-3333-3333-3333-333333333333',
        phone: '+919988776657',
        name: 'Amit Patel',
        email: 'amit@demo.com',
        role: 'buyer',
        is_verified: true
      }
    ]

    // Insert users
    const { error: usersError } = await supabase
      .from('users')
      .insert(demoUsers)
    
    if (usersError) {
      console.error('Error creating users:', usersError)
      throw usersError
    }

    // Create seller profiles
    const sellerProfiles = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        business_name: 'Priya Fashion House',
        business_category: 'Fashion & Clothing',
        upi_id: 'priya.fashion@paytm',
        bank_account: '1234567890',
        ifsc_code: 'HDFC0001234',
        pickup_address: {
          address_line1: 'Shop No. 45, Karol Bagh Market',
          address_line2: 'Near Metro Station',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110005',
          phone: '+919876543210'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'priya-fashion',
        store_theme: 'modern',
        commission_rate: 2.5,
        total_sales: 2500000.00,
        total_orders: 850,
        rating: 4.8
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        business_name: 'Ananya Boutique',
        business_category: 'Fashion & Clothing',
        upi_id: 'ananya.boutique@gpay',
        bank_account: '2345678901',
        ifsc_code: 'ICIC0001234',
        pickup_address: {
          address_line1: 'Brigade Road',
          address_line2: 'Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          phone: '+919876543211'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'ananya-boutique',
        store_theme: 'elegant',
        commission_rate: 2.5,
        total_sales: 1800000.00,
        total_orders: 620,
        rating: 4.7
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        business_name: 'Kavya Ethnic Wear',
        business_category: 'Fashion & Clothing',
        upi_id: 'kavya.ethnic@phonepe',
        bank_account: '3456789012',
        ifsc_code: 'SBIN0001234',
        pickup_address: {
          address_line1: 'Chandni Chowk',
          address_line2: 'Old Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110006',
          phone: '+919876543212'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'kavya-ethnic',
        store_theme: 'traditional',
        commission_rate: 2.5,
        total_sales: 3200000.00,
        total_orders: 1100,
        rating: 4.9
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        business_name: 'Lakshmi Jewellers',
        business_category: 'Jewelry & Accessories',
        upi_id: 'lakshmi.jewels@paytm',
        bank_account: '4567890123',
        ifsc_code: 'HDFC0005678',
        pickup_address: {
          address_line1: 'Zaveri Bazaar',
          address_line2: 'Kalbadevi',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          phone: '+919876543213'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'lakshmi-jewellers',
        store_theme: 'luxury',
        commission_rate: 3.0,
        total_sales: 5500000.00,
        total_orders: 450,
        rating: 4.9
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        business_name: 'Royal Gems',
        business_category: 'Jewelry & Accessories',
        upi_id: 'royal.gems@gpay',
        bank_account: '5678901234',
        ifsc_code: 'AXIS0001234',
        pickup_address: {
          address_line1: 'Jubilee Hills',
          address_line2: 'Road No. 36',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
          phone: '+919876543214'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'royal-gems',
        store_theme: 'premium',
        commission_rate: 3.0,
        total_sales: 4200000.00,
        total_orders: 380,
        rating: 4.8
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        business_name: 'Sona Jewels',
        business_category: 'Jewelry & Accessories',
        upi_id: 'sona.jewels@phonepe',
        bank_account: '6789012345',
        ifsc_code: 'ICIC0009876',
        pickup_address: {
          address_line1: 'Johari Bazaar',
          address_line2: 'Pink City',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001',
          phone: '+919876543215'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'sona-jewels',
        store_theme: 'traditional',
        commission_rate: 3.0,
        total_sales: 3800000.00,
        total_orders: 520,
        rating: 4.7
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        business_name: 'Meera Collections',
        business_category: 'Fashion & Jewelry',
        upi_id: 'meera.collections@paytm',
        bank_account: '7890123456',
        ifsc_code: 'SBIN0009876',
        pickup_address: {
          address_line1: 'MG Road',
          address_line2: 'Near City Mall',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          phone: '+919876543216'
        },
        onboarding_completed: true,
        verification_status: 'verified',
        store_slug: 'meera-collections',
        store_theme: 'modern',
        commission_rate: 2.8,
        total_sales: 2900000.00,
        total_orders: 720,
        rating: 4.8
      }
    ]

    // Insert seller profiles
    const { error: sellersError } = await supabase
      .from('sellers')
      .insert(sellerProfiles)
    
    if (sellersError) {
      console.error('Error creating sellers:', sellersError)
      throw sellersError
    }

    // Create buyer profiles
    const buyerProfiles = [
      {
        id: 'b1111111-1111-1111-1111-111111111111',
        total_spent: 125000,
        order_history_count: 8
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        total_spent: 85000,
        order_history_count: 5
      },
      {
        id: 'b3333333-3333-3333-3333-333333333333',
        total_spent: 195000,
        order_history_count: 12
      }
    ]

    const { error: buyersError } = await supabase
      .from('buyers')
      .insert(buyerProfiles)
    
    if (buyersError) {
      console.error('Error creating buyers:', buyersError)
      throw buyersError
    }

    // Create sample products
    await createSampleProducts(supabase)

    return NextResponse.json({ 
      message: 'Demo fashion and jewelry data created successfully',
      credentials: {
        sellers: [
          { email: 'priya@shopabell.demo', password: 'Demo123!', name: 'Priya Fashion House' },
          { email: 'ananya@shopabell.demo', password: 'Demo123!', name: 'Ananya Boutique' },
          { email: 'kavya@shopabell.demo', password: 'Demo123!', name: 'Kavya Ethnic Wear' },
          { email: 'lakshmi@shopabell.demo', password: 'Demo123!', name: 'Lakshmi Jewellers' },
          { email: 'royal@shopabell.demo', password: 'Demo123!', name: 'Royal Gems' },
          { email: 'sona@shopabell.demo', password: 'Demo123!', name: 'Sona Jewels' },
          { email: 'meera@shopabell.demo', password: 'Demo123!', name: 'Meera Collections' }
        ],
        buyers: [
          { email: 'rahul@demo.com', password: 'Demo123!', name: 'Rahul Kumar' },
          { email: 'sneha@demo.com', password: 'Demo123!', name: 'Sneha Sharma' },
          { email: 'amit@demo.com', password: 'Demo123!', name: 'Amit Patel' }
        ]
      }
    })
    
  } catch (error) {
    console.error('Error in seed-fashion-jewelry:', error)
    return NextResponse.json({ 
      error: 'Failed to create demo data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function createSampleProducts(supabase: any) {
  const products = [
    // Priya Fashion House Products
    {
      id: 'p1111111-1111-1111-1111-111111111111',
      seller_id: '11111111-1111-1111-1111-111111111111',
      name: 'Banarasi Silk Saree - Royal Blue',
      description: 'Exquisite handwoven Banarasi silk saree with intricate gold zari work. Perfect for weddings and special occasions.',
      short_description: 'Premium Banarasi silk saree with gold zari',
      price: 8999,
      original_price: 12999,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop'],
      stock_quantity: 15,
      category: 'Fashion & Clothing',
      subcategory: 'Sarees',
      tags: ['banarasi', 'silk', 'wedding', 'blue', 'gold', 'traditional'],
      is_active: true,
      is_featured: true,
      view_count: 1250,
      rating: 4.8,
      cod_available: true
    },
    {
      id: 'p1111111-1111-1111-1111-111111111112',
      seller_id: '11111111-1111-1111-1111-111111111111',
      name: 'Designer Georgette Saree - Pink',
      description: 'Beautiful designer georgette saree with sequin work and embroidered border.',
      short_description: 'Designer georgette saree with sequin work',
      price: 3499,
      original_price: 4999,
      images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop'],
      stock_quantity: 25,
      category: 'Fashion & Clothing',
      subcategory: 'Sarees',
      tags: ['georgette', 'designer', 'pink', 'party', 'sequin'],
      is_active: true,
      is_featured: false,
      view_count: 890,
      rating: 4.7,
      cod_available: true
    },
    // Add more products for other sellers...
    {
      id: 'p4444444-4444-4444-4444-444444444441',
      seller_id: '44444444-4444-4444-4444-444444444444',
      name: '22k Gold Temple Necklace Set',
      description: 'Traditional South Indian temple jewelry necklace set. Made with 22k gold, featuring intricate Lakshmi pendant.',
      short_description: '22k gold temple necklace with earrings',
      price: 185000,
      original_price: 195000,
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
      stock_quantity: 3,
      category: 'Jewelry & Accessories',
      subcategory: 'Necklaces',
      tags: ['gold', 'temple', 'necklace', '22k', 'traditional', 'wedding'],
      is_active: true,
      is_featured: true,
      view_count: 3200,
      rating: 4.9,
      cod_available: false
    }
  ]

  const { error } = await supabase
    .from('products')
    .insert(products)
  
  if (error) {
    console.error('Error creating products:', error)
    throw error
  }
}