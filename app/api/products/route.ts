import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { authService } from '@/lib/auth/auth-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: products, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      category, 
      stock_quantity, 
      image_url, 
      source = 'manual',
      ai_extracted_data,
      user_id 
    } = body

    // Validate required fields
    if (!name || !price || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and user_id are required' },
        { status: 400 }
      )
    }

    // Validate price
    if (price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        category: category || null,
        stock_quantity: parseInt(stock_quantity) || 1,
        image_url: image_url || null,
        source,
        ai_extracted_data: ai_extracted_data || null,
        user_id,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      )
    }

    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        user_id,
        event_type: 'product_created',
        event_data: {
          product_id: product.id,
          source,
          category,
          price: parseFloat(price)
        }
      })

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      name, 
      description, 
      price, 
      category, 
      stock_quantity, 
      image_url,
      is_active = true,
      user_id 
    } = body

    // Validate required fields
    if (!id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID and user_id are required' },
        { status: 400 }
      )
    }

    // Check ownership
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError || !existingProduct || existingProduct.user_id !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (price !== undefined) updateData.price = parseFloat(price)
    if (category !== undefined) updateData.category = category
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity)
    if (image_url !== undefined) updateData.image_url = image_url
    if (is_active !== undefined) updateData.is_active = is_active

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      )
    }

    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        user_id,
        event_type: 'product_updated',
        event_data: {
          product_id: id,
          changes: Object.keys(updateData)
        }
      })

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json(
        { success: false, error: 'Product ID and user ID are required' },
        { status: 400 }
      )
    }

    // Check ownership
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError || !existingProduct || existingProduct.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Soft delete (mark as inactive)
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: 'product_deleted',
        event_data: {
          product_id: id
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}