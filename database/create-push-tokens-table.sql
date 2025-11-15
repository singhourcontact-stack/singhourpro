-- Create push_tokens table to store device push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pro_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
    device_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (pro_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_pro_id ON push_tokens(pro_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(pro_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own push tokens
CREATE POLICY "Users can view their own push tokens"
    ON push_tokens FOR SELECT
    USING (auth.uid() = pro_id);

-- Users can insert their own push tokens
CREATE POLICY "Users can insert their own push tokens"
    ON push_tokens FOR INSERT
    WITH CHECK (auth.uid() = pro_id);

-- Users can update their own push tokens
CREATE POLICY "Users can update their own push tokens"
    ON push_tokens FOR UPDATE
    USING (auth.uid() = pro_id);

-- Users can delete their own push tokens
CREATE POLICY "Users can delete their own push tokens"
    ON push_tokens FOR DELETE
    USING (auth.uid() = pro_id);

