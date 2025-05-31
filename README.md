# ShopAbell - Social Commerce Platform

A revolutionary social commerce platform that transforms social media presence into thriving e-commerce businesses.

## Features

- 🚀 **Instant Store Setup** - WhatsApp-based onboarding in minutes
- 📱 **Phone Authentication** - Simple OTP-based login system
- 🎥 **Live Selling** - Convert livestreams into product catalogs (coming soon)
- 💬 **Chat Commerce** - Sell directly through chat with smart commands
- 📊 **Analytics Dashboard** - Track sales and performance
- 🚚 **Automated Shipping** - Integrated courier management
- 💰 **Instant Payments** - Virtual accounts for each seller

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd shopabell
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL scripts in `supabase/schema.sql`
   - Optionally run `supabase/seed.sql` for test data

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
├── (auth)/          # Authentication pages
├── (dashboard)/     # Seller dashboard
├── (store)/         # Buyer store pages
├── (admin)/         # Admin panel
└── api/             # API routes

components/
├── auth/            # Auth components
├── ui/              # Reusable UI components
└── providers/       # Context providers

lib/
├── auth/            # Auth utilities
├── supabase/        # Supabase client
├── stores/          # Zustand stores
└── utils/           # Helper functions
```

## Development Workflow

1. **Authentication**: Users sign up/login with phone numbers
2. **Seller Onboarding**: Complete profile and store setup
3. **Product Management**: Add products manually or via livestream
4. **Order Processing**: Handle orders with automated shipping
5. **Analytics**: Track performance and growth

## Key Features Implementation Status

- ✅ Authentication System
- ✅ Database Schema
- ✅ Basic Dashboard
- ⏳ Product Management
- ⏳ Order System
- ⏳ Chat Commerce
- ⏳ Livestream Capture
- ⏳ WhatsApp Integration
- ⏳ Payment Processing
- ⏳ Shipping Integration

## Contributing

Please read our contributing guidelines before submitting PRs.

## License

This project is proprietary software.