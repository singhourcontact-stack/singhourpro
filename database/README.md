# Database Setup Guide

## 🗄️ Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### Step 2: Run the SQL Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `schema.sql`
4. Click **Run** to execute the script

### Step 3: Configure Environment Variables
Add these to your `.env` file or app configuration:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Verify Setup
1. Open the app
2. Go to **Settings** → **Vérification des données**
3. Click **Lancer la vérification**
4. All tests should show ✅ success

## 📊 Database Tables Created

The schema creates the following tables:

- **profiles** - User profiles and information
- **offers** - Professional service offers
- **working_hours** - Professional working hours
- **blocked_dates** - Blocked time slots
- **reservations** - Booking reservations
- **portfolio** - Professional portfolio photos
- **google_calendar_settings** - Google Calendar sync settings
- **notifications** - User notifications
- **payments** - Payment transactions

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their own data
- **Authentication** required for all operations
- **Data validation** with proper constraints

## 🚀 Sample Data

The schema includes sample data for testing:
- Sample professional user
- Sample client user
- Sample working hours
- Sample offers

## 🔧 Troubleshooting

### Common Issues:

1. **"Table not found" errors**
   - Make sure you ran the complete `schema.sql` script
   - Check that all tables were created successfully

2. **"Permission denied" errors**
   - Verify RLS policies are properly set up
   - Check that user is authenticated

3. **"Column not found" errors**
   - Ensure the schema was run completely
   - Check for any missing columns in the table structure

### Verification Steps:

1. Check Supabase dashboard → **Table Editor**
2. Verify all tables are present
3. Check that RLS is enabled
4. Test with the app's data verification tool

## 📝 Notes

- The schema includes proper indexes for performance
- All tables have `created_at` and `updated_at` timestamps
- Foreign key relationships are properly configured
- Sample data is included for immediate testing
