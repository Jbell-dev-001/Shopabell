import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const sellerId = searchParams.get('sellerId')
    const buyerId = searchParams.get('buyerId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        product:products(name, images, price),
        buyer:buyers(
          users:users!id(name, phone)
        ),
        seller:sellers(
          business_name,
          users:users!id(phone)
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (sellerId) {
      query = query.eq('seller_id', sellerId)
    }
    
    if (buyerId) {
      query = query.eq('buyer_id', buyerId)
    }
    
    if (status) {
      query = query.eq('order_status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      throw error
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    if (sellerId) {
      countQuery = countQuery.eq('seller_id', sellerId)
    }
    
    if (buyerId) {
      countQuery = countQuery.eq('buyer_id', buyerId)
    }
    
    if (status) {
      countQuery = countQuery.eq('order_status', status)
    }

    const { count } = await countQuery

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.buyer_id || !orderData.seller_id || !orderData.product_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate order number if not provided
    if (!orderData.order_number) {
      orderData.order_number = `ORD${Date.now().toString(36).toUpperCase()}`
    }

    // Set default values
    const order = {
      payment_status: 'pending',
      order_status: 'pending',
      created_via: 'api',
      platform_fee: orderData.total_amount * 0.03,
      ...orderData
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}