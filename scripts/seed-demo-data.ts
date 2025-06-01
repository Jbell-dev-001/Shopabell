#!/usr/bin/env tsx
// Script to seed demo data programmatically

async function seedDemoData(baseUrl: string) {
  console.log('🌱 Starting demo data seeding...')
  
  try {
    // Seed fashion and jewelry sellers
    console.log('📦 Seeding fashion and jewelry demo sellers...')
    const fashionResponse = await fetch(`${baseUrl}/api/demo/seed-fashion-jewelry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (fashionResponse.ok) {
      const result = await fashionResponse.json()
      console.log('✅ Fashion & Jewelry sellers:', result.message)
    } else {
      console.error('❌ Fashion seeding failed:', await fashionResponse.text())
    }

    // Seed general demo users
    console.log('👥 Seeding general demo users...')
    const usersResponse = await fetch(`${baseUrl}/api/demo/seed-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (usersResponse.ok) {
      const result = await usersResponse.json()
      console.log('✅ General users:', result.message)
    } else {
      console.error('❌ Users seeding failed:', await usersResponse.text())
    }

    // Create sample chats
    console.log('💬 Creating sample chats...')
    const chatsResponse = await fetch(`${baseUrl}/api/demo/create-sample-chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (chatsResponse.ok) {
      const result = await chatsResponse.json()
      console.log('✅ Sample chats:', result.message)
    } else {
      console.error('❌ Chats creation failed:', await chatsResponse.text())
    }

    console.log('\n🎉 Demo data seeding completed!')
    console.log('\n📋 Demo Accounts Created:')
    console.log('👩‍💼 Sellers:')
    console.log('  • Priya Fashion House - +919876543210')
    console.log('  • Ananya Boutique - +919876543211') 
    console.log('  • Kavya Ethnic Wear - +919876543212')
    console.log('  • Lakshmi Jewellers - +919876543213')
    console.log('  • Royal Gems - +919876543214')
    console.log('  • Sona Jewels - +919876543215')
    console.log('  • Meera Collections - +919876543216')
    console.log('\n🔑 Login: Use phone numbers with OTP "123456"')
    console.log('🛍️  Demo stores available at /explore')

  } catch (error) {
    console.error('💥 Seeding failed:', error)
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const baseUrl = args[0] || 'http://localhost:3000'
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌱 ShopAbell Demo Data Seeder

Usage: npm run seed-demo [base-url]

Arguments:
  base-url    Base URL of the application (default: http://localhost:3000)

Examples:
  npm run seed-demo                                    # Seed local development
  npm run seed-demo https://shopabell.vercel.app      # Seed production

This script will:
  • Create 7 demo seller accounts with Indian fashion/jewelry products
  • Set up demo buyer accounts
  • Generate sample chat conversations
  • Populate stores with authentic product data
`)
    return
  }

  console.log(`🎯 Target: ${baseUrl}`)
  console.log('⏳ This may take a few moments...\n')
  
  await seedDemoData(baseUrl)
}

if (require.main === module) {
  main().catch(console.error)
}

export { seedDemoData }