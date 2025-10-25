-- Fix portfolio table structure
-- Run this in your Supabase SQL Editor

-- First, let's check what columns exist in the portfolio table
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'portfolio';

-- Add missing columns to portfolio table
ALTER TABLE portfolio 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES profiles(id);

-- Update the table to ensure it has the right structure
-- If the table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolio
CREATE POLICY "Users can view all portfolio items" ON portfolio
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own portfolio items" ON portfolio
FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update their own portfolio items" ON portfolio
FOR UPDATE USING (auth.uid() = professional_id);

CREATE POLICY "Users can delete their own portfolio items" ON portfolio
FOR DELETE USING (auth.uid() = professional_id);
