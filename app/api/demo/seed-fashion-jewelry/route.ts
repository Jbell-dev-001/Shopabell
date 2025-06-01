import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Delete demo data in reverse order of creation to avoid foreign key constraints
    console.log('Deleting demo data...')
    
    // Delete products first
    await supabase.from('products').delete().in('seller_id', [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666',
      '77777777-7777-7777-7777-777777777777'
    ])
    
    // Delete buyer profiles
    await supabase.from('buyers').delete().in('id', [
      'b1111111-1111-1111-1111-111111111111',
      'b2222222-2222-2222-2222-222222222222',
      'b3333333-3333-3333-3333-333333333333'
    ])
    
    // Delete seller profiles
    await supabase.from('sellers').delete().in('id', [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666',
      '77777777-7777-7777-7777-777777777777'
    ])
    
    // Delete users
    await supabase.from('users').delete().in('id', [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666',
      '77777777-7777-7777-7777-777777777777',
      'b1111111-1111-1111-1111-111111111111',
      'b2222222-2222-2222-2222-222222222222',
      'b3333333-3333-3333-3333-333333333333'
    ])
    
    console.log('Demo data deleted successfully')
    
    return NextResponse.json({ 
      message: 'Demo data deleted successfully' 
    })
    
  } catch (error) {
    console.error('Error deleting demo data:', error)
    return NextResponse.json({ 
      error: 'Failed to delete demo data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createServiceRoleClient()
    
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
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        phone: '+919988776656',
        name: 'Sneha Sharma',
        email: 'sneha@demo.com',
        role: 'buyer',
        language_preference: 'en',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      },
      {
        id: 'b3333333-3333-3333-3333-333333333333',
        phone: '+919988776657',
        name: 'Amit Patel',
        email: 'amit@demo.com',
        role: 'buyer',
        language_preference: 'hi',
        is_verified: true,
        timezone: 'Asia/Kolkata'
      }
    ]

    // Insert users
    console.log('Inserting users...')
    const { error: usersError } = await supabase
      .from('users')
      .insert(demoUsers)
    
    if (usersError) {
      console.error('Error creating users:', usersError)
      throw new Error(`Failed to create users: ${usersError.message}`)
    }
    console.log('Users created successfully')

    // Create seller profiles
    const sellerProfiles = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        phone: '+919876543210',
        business_name: 'Priya Fashion House',
        business_type: 'Fashion & Clothing',
        owner_name: 'Priya Sharma',
        business_address: 'Shop No. 45, Karol Bagh Market, Near Metro Station, New Delhi, Delhi, 110005',
        bank_account_number: '1234567890',
        ifsc_code: 'HDFC0001234',
        pan_number: 'ABCDE1234F',
        store_name: 'Priya Fashion House',
        store_slug: 'priya-fashion',
        upi_id: 'priya.fashion@paytm',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'modern',
        commission_rate: 2.5,
        total_sales: 2500000.00,
        total_orders: 850,
        rating: 4.8
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        phone: '+919876543211',
        business_name: 'Ananya Boutique',
        business_type: 'Fashion & Clothing',
        owner_name: 'Ananya Singh',
        business_address: 'Brigade Road, Commercial Street, Bangalore, Karnataka, 560001',
        bank_account_number: '2345678901',
        ifsc_code: 'ICIC0001234',
        pan_number: 'BCDEF2345G',
        store_name: 'Ananya Boutique',
        store_slug: 'ananya-boutique',
        upi_id: 'ananya.boutique@gpay',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'elegant',
        commission_rate: 2.5,
        total_sales: 1800000.00,
        total_orders: 620,
        rating: 4.7
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        phone: '+919876543212',
        business_name: 'Kavya Ethnic Wear',
        business_type: 'Fashion & Clothing',
        owner_name: 'Kavya Gupta',
        business_address: 'Chandni Chowk, Old Delhi, Delhi, Delhi, 110006',
        bank_account_number: '3456789012',
        ifsc_code: 'SBIN0001234',
        pan_number: 'CDEFG3456H',
        store_name: 'Kavya Ethnic Wear',
        store_slug: 'kavya-ethnic',
        upi_id: 'kavya.ethnic@phonepe',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'traditional',
        commission_rate: 2.5,
        total_sales: 3200000.00,
        total_orders: 1100,
        rating: 4.9
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        phone: '+919876543213',
        business_name: 'Lakshmi Jewellers',
        business_type: 'Jewelry & Accessories',
        owner_name: 'Lakshmi Devi',
        business_address: 'Zaveri Bazaar, Kalbadevi, Mumbai, Maharashtra, 400002',
        bank_account_number: '4567890123',
        ifsc_code: 'HDFC0005678',
        pan_number: 'DEFGH4567I',
        store_name: 'Lakshmi Jewellers',
        store_slug: 'lakshmi-jewellers',
        upi_id: 'lakshmi.jewels@paytm',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'luxury',
        commission_rate: 3.0,
        total_sales: 5500000.00,
        total_orders: 450,
        rating: 4.9
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        phone: '+919876543214',
        business_name: 'Royal Gems',
        business_type: 'Jewelry & Accessories',
        owner_name: 'Raj Kumar',
        business_address: 'Jubilee Hills, Road No. 36, Hyderabad, Telangana, 500033',
        bank_account_number: '5678901234',
        ifsc_code: 'AXIS0001234',
        pan_number: 'EFGHI5678J',
        store_name: 'Royal Gems',
        store_slug: 'royal-gems',
        upi_id: 'royal.gems@gpay',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'premium',
        commission_rate: 3.0,
        total_sales: 4200000.00,
        total_orders: 380,
        rating: 4.8
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        phone: '+919876543215',
        business_name: 'Sona Jewels',
        business_type: 'Jewelry & Accessories',
        owner_name: 'Sona Agarwal',
        business_address: 'Johari Bazaar, Pink City, Jaipur, Rajasthan, 302001',
        bank_account_number: '6789012345',
        ifsc_code: 'ICIC0009876',
        pan_number: 'FGHIJ6789K',
        store_name: 'Sona Jewels',
        store_slug: 'sona-jewels',
        upi_id: 'sona.jewels@phonepe',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'traditional',
        commission_rate: 3.0,
        total_sales: 3800000.00,
        total_orders: 520,
        rating: 4.7
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        phone: '+919876543216',
        business_name: 'Meera Collections',
        business_type: 'Fashion & Jewelry',
        owner_name: 'Meera Patel',
        business_address: 'MG Road, Near City Mall, Pune, Maharashtra, 411001',
        bank_account_number: '7890123456',
        ifsc_code: 'SBIN0009876',
        pan_number: 'GHIJK7890L',
        store_name: 'Meera Collections',
        store_slug: 'meera-collections',
        upi_id: 'meera.collections@paytm',
        onboarding_completed: true,
        verification_status: 'verified',
        store_theme: 'modern',
        commission_rate: 2.8,
        total_sales: 2900000.00,
        total_orders: 720,
        rating: 4.8
      }
    ]

    // Insert seller profiles
    console.log('Inserting seller profiles...')
    const { error: sellersError } = await supabase
      .from('sellers')
      .insert(sellerProfiles)
    
    if (sellersError) {
      console.error('Error creating sellers:', sellersError)
      throw new Error(`Failed to create sellers: ${sellersError.message}`)
    }
    console.log('Seller profiles created successfully')

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

    console.log('Inserting buyer profiles...')
    const { error: buyersError } = await supabase
      .from('buyers')
      .insert(buyerProfiles)
    
    if (buyersError) {
      console.error('Error creating buyers:', buyersError)
      throw new Error(`Failed to create buyers: ${buyersError.message}`)
    }
    console.log('Buyer profiles created successfully')

    // Create sample products
    console.log('Creating sample products...')
    await createSampleProducts(supabase)
    console.log('Sample products created successfully')

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Failed to create demo data',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
}

async function createSampleProducts(supabase: any) {
  const products = [
    // Priya Fashion House Products
    {
      id: '21111111-1111-1111-1111-111111111111',
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
      cod_available: true
    },
    {
      id: '21111111-1111-1111-1111-111111111112',
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
      cod_available: true
    },
    // Add more products for other sellers...
    {
      id: '24444444-4444-4444-4444-444444444441',
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
      cod_available: false
    }
  ]

  const { error } = await supabase
    .from('products')
    .insert(products)
  
  if (error) {
    console.error('Error creating products:', error)
    throw new Error(`Failed to create products: ${error.message}`)
  }
}