-- Create payment_infos table for storing professional payment information
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (to avoid conflicts with old structure)
DROP TABLE IF EXISTS payment_infos CASCADE;

-- Create payment_infos table
CREATE TABLE payment_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pro_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  rib TEXT,
  iban TEXT,
  bic TEXT,
  paypal_email TEXT,
  paypal_connected BOOLEAN DEFAULT false,
  fiscal_name TEXT,
  fiscal_address TEXT,
  fiscal_number TEXT,
  stripe_account_id TEXT,
  stripe_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_infos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_infos
CREATE POLICY "Users can view their own payment info" ON payment_infos
FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "Users can insert their own payment info" ON payment_infos
FOR INSERT WITH CHECK (auth.uid() = pro_id);

CREATE POLICY "Users can update their own payment info" ON payment_infos
FOR UPDATE USING (auth.uid() = pro_id);

CREATE POLICY "Users can delete their own payment info" ON payment_infos
FOR DELETE USING (auth.uid() = pro_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_infos_pro_id ON payment_infos(pro_id);
