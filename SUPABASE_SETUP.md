# Supabase Setup Guide for RecycloAI

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `recycloai`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL commands

## 5. Configure Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `waste-images`
3. Set the bucket to public
4. Configure RLS policies for the bucket

## 6. Update Authentication Settings

1. Go to Authentication → Settings
2. Configure your site URL (e.g., `http://localhost:8080`)
3. Add redirect URLs:
   - `http://localhost:8080/auth/callback`
   - `http://localhost:8080/dashboard`

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Try registering a new user
3. Check if the user appears in the `users` table in Supabase

## Benefits of Using Supabase

✅ **No Backend Needed**: Direct database access from frontend
✅ **Built-in Authentication**: User management with email/password
✅ **Real-time Updates**: Live data synchronization
✅ **File Storage**: Image uploads for waste photos
✅ **Row Level Security**: Secure data access
✅ **Automatic API**: REST and GraphQL APIs generated
✅ **Scalable**: PostgreSQL database with automatic scaling

## Database Tables

- **users**: User profiles and statistics
- **scan_results**: Waste scanning history
- **achievements**: User achievements and gamification

## Next Steps

1. Update the Login/Register components to handle Supabase responses
2. Integrate the WasteScanner component with Supabase storage
3. Add real-time updates for user statistics
4. Implement achievement system with database triggers 