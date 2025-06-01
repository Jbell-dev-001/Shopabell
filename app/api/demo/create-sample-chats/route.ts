import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get demo users
    const { data: priyaSeller } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'priya@shopabell.demo')
      .single()
    
    const { data: rahulBuyer } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'rahul@demo.com')
      .single()
    
    const { data: lakshmiSeller } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'lakshmi@shopabell.demo')
      .single()
    
    if (!priyaSeller || !rahulBuyer || !lakshmiSeller) {
      return NextResponse.json(
        { error: 'Demo users not found. Please seed demo data first.' },
        { status: 400 }
      )
    }

    // Get products
    const { data: sareeProduct } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('seller_id', priyaSeller.id)
      .limit(1)
      .single()
    
    const { data: jewelryProduct } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('seller_id', lakshmiSeller.id)
      .limit(1)
      .single()

    if (!sareeProduct || !jewelryProduct) {
      return NextResponse.json(
        { error: 'Demo products not found. Please seed demo data first.' },
        { status: 400 }
      )
    }

    // Create chats
    const chatData = [
      {
        id: 'chat111-1111-1111-1111-111111111111',
        buyer_id: rahulBuyer.id,
        seller_id: priyaSeller.id,
        product_id: sareeProduct.id,
        chat_type: 'product_inquiry',
        status: 'active',
        unread_count_seller: 1,
        unread_count_buyer: 0,
        last_message_by: rahulBuyer.id,
        last_message_at: new Date().toISOString()
      },
      {
        id: 'chat222-2222-2222-2222-222222222222',
        buyer_id: rahulBuyer.id,
        seller_id: lakshmiSeller.id,
        product_id: jewelryProduct.id,
        chat_type: 'product_inquiry',
        status: 'order_created',
        unread_count_seller: 0,
        unread_count_buyer: 1,
        last_message_by: lakshmiSeller.id,
        last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]

    const { error: chatError } = await supabase
      .from('chats')
      .upsert(chatData)

    if (chatError) throw chatError

    // Create chat messages for first chat (active conversation)
    const chat1Messages = [
      {
        chat_id: 'chat111-1111-1111-1111-111111111111',
        sender_id: rahulBuyer.id,
        message_type: 'product',
        content: `Interested in ${sareeProduct.name}`,
        metadata: {
          product_id: sareeProduct.id,
          product_name: sareeProduct.name,
          product_image: sareeProduct.images[0],
          product_price: sareeProduct.price
        },
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat111-1111-1111-1111-111111111111',
        sender_id: rahulBuyer.id,
        message_type: 'text',
        content: 'Hi! Is this saree available in medium size?',
        created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat111-1111-1111-1111-111111111111',
        sender_id: priyaSeller.id,
        message_type: 'text',
        content: 'Hello! Yes, this beautiful Banarasi saree is available in medium size. The quality is excellent with pure silk and gold zari work.',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat111-1111-1111-1111-111111111111',
        sender_id: rahulBuyer.id,
        message_type: 'text',
        content: 'Great! What about the delivery time to Mumbai?',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      }
    ]

    // Create chat messages for second chat (completed order)
    const chat2Messages = [
      {
        chat_id: 'chat222-2222-2222-2222-222222222222',
        sender_id: rahulBuyer.id,
        message_type: 'product',
        content: `Interested in ${jewelryProduct.name}`,
        metadata: {
          product_id: jewelryProduct.id,
          product_name: jewelryProduct.name,
          product_image: jewelryProduct.images[0],
          product_price: jewelryProduct.price
        },
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat222-2222-2222-2222-222222222222',
        sender_id: rahulBuyer.id,
        message_type: 'text',
        content: 'This necklace is beautiful! Can you give me the best price?',
        created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat222-2222-2222-2222-222222222222',
        sender_id: lakshmiSeller.id,
        message_type: 'order',
        content: 'sell 175000',
        metadata: {
          command: {
            isValid: true,
            price: 175000,
            quantity: 1,
            paymentMethod: 'upi'
          },
          order_preview: {
            product_id: jewelryProduct.id,
            buyer_id: rahulBuyer.id,
            seller_id: lakshmiSeller.id,
            quantity: 1,
            unit_price: 175000,
            total_amount: 175000,
            payment_method: 'upi'
          },
          status: 'completed'
        },
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat222-2222-2222-2222-222222222222',
        sender_id: lakshmiSeller.id,
        message_type: 'system',
        content: 'Order created: 1 item for ₹175000 each. Total: ₹175000. Buyer can now proceed to checkout.',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat222-2222-2222-2222-222222222222',
        sender_id: rahulBuyer.id,
        message_type: 'text',
        content: 'Perfect! I have completed the payment. When will you ship it?',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        chat_id: 'chat222-2222-2222-2222-222222222222',
        sender_id: lakshmiSeller.id,
        message_type: 'text',
        content: 'Thank you for the order! We will ship it within 24 hours. You will receive tracking details soon.',
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      }
    ]

    const allMessages = [...chat1Messages, ...chat2Messages]
    
    const { error: messageError } = await supabase
      .from('chat_messages')
      .upsert(allMessages)

    if (messageError) throw messageError

    // Create a sample order from the second chat
    const orderData = {
      order_number: 'ORD' + Date.now().toString(36).toUpperCase(),
      buyer_id: rahulBuyer.id,
      seller_id: lakshmiSeller.id,
      product_id: jewelryProduct.id,
      quantity: 1,
      unit_price: 175000,
      total_amount: 175000,
      payment_method: 'upi',
      payment_status: 'completed',
      payment_transaction_id: 'TXN' + Date.now(),
      shipping_address: {
        name: 'Rahul Kumar',
        phone: '+919988776655',
        address: '123 MG Road, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058'
      },
      order_status: 'confirmed',
      created_via: 'chat',
      platform_fee: 5250
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    return NextResponse.json({
      message: 'Sample chats and order created successfully',
      data: {
        chatsCreated: 2,
        messagesCreated: allMessages.length,
        orderCreated: order.order_number
      }
    })

  } catch (error) {
    console.error('Error creating sample chats:', error)
    return NextResponse.json(
      { error: 'Failed to create sample chats' },
      { status: 500 }
    )
  }
}