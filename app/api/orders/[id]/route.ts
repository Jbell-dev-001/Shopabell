import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: orderId } = await params

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(name, images, price, description),
        buyer:buyers(
          users:users!id(name, phone, email)
        ),
        seller:sellers(
          business_name,
          pickup_address,
          users:users!id(phone)
        ),
        payment_transaction:payment_transactions(*)
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      throw error
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: orderId } = await params
    const updates = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id, created_at, order_number, ...allowedUpdates } = updates

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: orderId } = await params

    // Only allow cancellation of pending orders
    const { data: order } = await supabase
      .from('orders')
      .select('order_status')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return NextResponse.json(
        { error: 'Cannot cancel order in current status' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        cancellation_reason: 'Cancelled by request',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Order cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}