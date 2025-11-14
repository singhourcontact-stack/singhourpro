-- Create payment_infos table SAFELY (preserves existing data if table exists)
-- Run this in your Supabase SQL Editor

-- Step 1: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add/rename columns if they don't exist
DO $$ 
BEGIN
  -- Add/rename pro_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='pro_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='user_id') THEN
      -- Rename user_id to pro_id
      ALTER TABLE payment_infos RENAME COLUMN user_id TO pro_id;
    ELSE
      -- Add pro_id column
      ALTER TABLE payment_infos ADD COLUMN pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
      ALTER TABLE payment_infos ADD CONSTRAINT payment_infos_pro_id_unique UNIQUE (pro_id);
    END IF;
  END IF;

  -- Add other columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='rib') THEN
    ALTER TABLE payment_infos ADD COLUMN rib TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='iban') THEN
    ALTER TABLE payment_infos ADD COLUMN iban TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='bic') THEN
    ALTER TABLE payment_infos ADD COLUMN bic TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='paypal_email') THEN
    ALTER TABLE payment_infos ADD COLUMN paypal_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='paypal_connected') THEN
    ALTER TABLE payment_infos ADD COLUMN paypal_connected BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='fiscal_name') THEN
    ALTER TABLE payment_infos ADD COLUMN fiscal_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='fiscal_address') THEN
    ALTER TABLE payment_infos ADD COLUMN fiscal_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='fiscal_number') THEN
    ALTER TABLE payment_infos ADD COLUMN fiscal_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='stripe_account_id') THEN
    ALTER TABLE payment_infos ADD COLUMN stripe_account_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_infos' AND column_name='stripe_connected') THEN
    ALTER TABLE payment_infos ADD COLUMN stripe_connected BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 3: Enable RLS
ALTER TABLE payment_infos ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own payment info" ON payment_infos;
DROP POLICY IF EXISTS "Users can insert their own payment info" ON payment_infos;
DROP POLICY IF EXISTS "Users can update their own payment info" ON payment_infos;
DROP POLICY IF EXISTS "Users can delete their own payment info" ON payment_infos;

-- Step 5: Create RLS policies for payment_infos
CREATE POLICY "Users can view their own payment info" ON payment_infos
FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "Users can insert their own payment info" ON payment_infos
FOR INSERT WITH CHECK (auth.uid() = pro_id);

CREATE POLICY "Users can update their own payment info" ON payment_infos
FOR UPDATE USING (auth.uid() = pro_id);

CREATE POLICY "Users can delete their own payment info" ON payment_infos
FOR DELETE USING (auth.uid() = pro_id);

-- Step 6: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_infos_pro_id ON payment_infos(pro_id);
