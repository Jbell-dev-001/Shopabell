# Supabase Database Setup

## Setting up the Database

1. Create a new Supabase project at https://app.supabase.com

2. Once your project is created, go to the SQL Editor

3. Copy and paste the contents of `schema.sql` and run it to create all tables

4. Optionally, run `seed.sql` to add initial data

5. Copy your project credentials:
   - Project URL
   - Anon Key
   - Service Role Key (keep this secret!)

6. Update your `.env.local` file with these credentials

## Database Schema Overview

### Core Tables:
- **users**: Base user table for all user types
- **sellers**: Extended seller information
- **buyers**: Extended buyer information
- **products**: Product catalog
- **orders**: Order management
- **chats**: Communication system
- **livestream_sessions**: Live selling sessions

### Features:
- Row Level Security (RLS) enabled
- UUID primary keys
- JSONB for flexible data storage
- Proper indexes for performance
- Update triggers for timestamps

## Development Tips

1. Use Supabase Studio to view and manage data
2. Enable Realtime for tables that need live updates (chats, orders)
3. Use the SQL Editor for complex queries
4. Monitor RLS policies for proper access control

## Testing

To test the setup:
1. Create a test user through Supabase Auth
2. Insert corresponding seller/buyer records
3. Create test products and orders
4. Verify RLS policies are working correctly