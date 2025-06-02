# ShopAbell - WhatsApp First E-commerce Platform

**Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase**

ShopAbell is a modern e-commerce platform designed specifically for small businesses in India. It enables sellers to create and manage their online stores through a WhatsApp-like interface, leveraging AI for product management and providing seamless order processing.

## 🚀 What's Built So Far

### ✅ Completed Features (Phase 1)

1. **Core Infrastructure**
   - Next.js 14 with App Router and TypeScript
   - Tailwind CSS for responsive design
   - Supabase integration for database and auth
   - PWA configuration with offline support

2. **Database Schema**
   - Complete database design with 12+ tables
   - User management with phone-based authentication
   - Product catalog with AI metadata support
   - Order management system
   - Chat system architecture
   - Analytics events tracking
   - Partnership applications

3. **Authentication System**
   - Phone-based OTP verification
   - No email required (WhatsApp-first approach)
   - Session management
   - Demo accounts for testing

4. **WhatsApp Onboarding Simulation**
   - Interactive chat-like interface
   - Progressive business setup
   - Phone verification flow
   - Business information collection
   - Automatic user creation

5. **User Interface Components**
   - Responsive landing page
   - WhatsApp-style chat bubbles
   - Phone and OTP input components
   - Dashboard layout
   - Mobile-first design

6. **PWA Features**
   - Service worker for offline support
   - App manifest for installation
   - Background sync capabilities
   - Responsive icons

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom phone-based OTP system
- **State Management**: Zustand (planned)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **PWA**: Next.js PWA plugin
- **Deployment**: Vercel (ready)

## 📁 Project Structure

```
shopabell/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   └── login/               # Login page
│   ├── dashboard/               # Protected dashboard
│   ├── whatsapp-onboarding/     # Onboarding simulation
│   ├── api/                     # API routes
│   │   └── auth/               # Authentication endpoints
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   ├── auth/                   # Authentication components
│   ├── ui/                     # Base UI components
│   └── ...
├── lib/                        # Utilities and services
│   ├── auth/                   # Auth service and utils
│   ├── supabase/              # Database client
│   └── utils/                 # Utility functions
├── types/                      # TypeScript type definitions
├── supabase/                   # Database schema and migrations
├── public/                     # Static assets
└── scripts/                    # Setup and utility scripts
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd shopabell

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from Settings > API
3. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the database schema:
   - Copy contents of `supabase/schema.sql`
   - Paste in Supabase SQL Editor and execute

5. Seed demo data:
   - Copy contents of `supabase/seed.sql`
   - Paste in Supabase SQL Editor and execute

### 4. Development

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

## 🧪 Demo Accounts

For testing purposes, use these demo phone numbers:

- **Phone**: `+919999999991`, `+919999999992`, `+919999999993`, `+919999999994`
- **OTP**: `123456` (for all demo accounts)

## 📱 Key Features Implemented

### WhatsApp Onboarding
- Navigate to `/whatsapp-onboarding`
- Complete chat-like business setup
- Phone verification with OTP
- Automatic user account creation

### Authentication
- Phone-based login at `/login`
- OTP verification system
- Session management
- Redirect to dashboard after login

### Dashboard
- Basic seller dashboard at `/dashboard`
- User profile display
- Quick action cards (placeholders)
- Getting started guide

## 🔄 Next Development Phases

### Phase 2: Product Management (Next)
- [ ] Manual product entry form
- [ ] Product listing and management
- [ ] Image upload and storage
- [ ] Categories and inventory

### Phase 3: AI Features
- [ ] AI livestream capture widget
- [ ] TensorFlow.js integration
- [ ] Video-to-catalog conversion
- [ ] Product data extraction

### Phase 4: Chat & Orders
- [ ] Real-time chat system
- [ ] "Sell" command parser
- [ ] Order creation and management
- [ ] Payment integration (simulated)

### Phase 5: Advanced Features
- [ ] Analytics dashboard
- [ ] Partnership program
- [ ] Shipping integration
- [ ] Multi-language support

## 🚀 Deployment

The application is ready for deployment on Vercel:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## 📊 Database Schema Overview

The application includes a comprehensive database schema with:

- **users**: Phone-based user accounts
- **products**: Product catalog with AI support
- **orders**: Complete order management
- **chat_conversations & chat_messages**: Real-time messaging
- **analytics_events**: Business intelligence
- **partnership_applications**: B2B partnerships
- **otp_verifications**: Security and auth

## 🔐 Security Features

- Phone-based authentication (no passwords)
- OTP verification system
- Rate limiting (planned)
- Input validation with Zod
- SQL injection protection
- XSS prevention

## 📈 Performance Optimizations

- Next.js App Router for optimal performance
- Image optimization with Next.js Image
- Progressive Web App capabilities
- Service worker for offline support
- Code splitting and lazy loading
- Responsive design for mobile-first experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the [Implementation Plan](IMPLEMENTATION_PLAN.md)
2. Review the database schema in `supabase/schema.sql`
3. Test with demo accounts
4. Create an issue for bugs or feature requests

---

**Built with ❤️ for small businesses in India**