-- SINGHOUR'S Pro Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'professionnel')),
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telephone TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    rib TEXT,
    bic TEXT,
    paypal_email TEXT,
    fiscal_info JSONB,
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration TEXT NOT NULL,
    category TEXT,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create working_hours table
CREATE TABLE IF NOT EXISTS working_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL,
    date DATE NOT NULL,
    time_slots TEXT[] NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(professional_id, date),
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    offer_id UUID NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration TEXT NOT NULL,
    location TEXT,
    price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refused', 'completed', 'cancelled')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL,
    photo_url TEXT NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create google_calendar_settings table
CREATE TABLE IF NOT EXISTS google_calendar_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    last_sync TIMESTAMP WITH TIME ZONE,
    auto_sync BOOLEAN DEFAULT false,
    auto_block BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'system', 'marketing')),
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_offers_professional_id ON offers(professional_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_working_hours_professional_id ON working_hours(professional_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_professional_id ON blocked_dates(professional_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);
CREATE INDEX IF NOT EXISTS idx_reservations_client_id ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_professional_id ON reservations(professional_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_professional_id ON portfolio(professional_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for offers
CREATE POLICY "Users can view all active offers" ON offers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can manage their own offers" ON offers
    FOR ALL USING (auth.uid() = professional_id);

-- RLS Policies for working_hours
CREATE POLICY "Professionals can manage their own working hours" ON working_hours
    FOR ALL USING (auth.uid() = professional_id);

-- RLS Policies for blocked_dates
CREATE POLICY "Professionals can manage their own blocked dates" ON blocked_dates
    FOR ALL USING (auth.uid() = professional_id);

-- RLS Policies for reservations
CREATE POLICY "Users can view their own reservations" ON reservations
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Professionals can update their reservations" ON reservations
    FOR UPDATE USING (auth.uid() = professional_id);

-- RLS Policies for portfolio
CREATE POLICY "Users can view all portfolio items" ON portfolio
    FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their own portfolio" ON portfolio
    FOR ALL USING (auth.uid() = professional_id);

-- RLS Policies for google_calendar_settings
CREATE POLICY "Professionals can manage their own calendar settings" ON google_calendar_settings
    FOR ALL USING (auth.uid() = professional_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT client_id FROM reservations WHERE id = reservation_id
            UNION
            SELECT professional_id FROM reservations WHERE id = reservation_id
        )
    );

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON working_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocked_dates_updated_at BEFORE UPDATE ON blocked_dates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_settings_updated_at BEFORE UPDATE ON google_calendar_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO profiles (id, role, prenom, nom, email, telephone, bio, location) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'professionnel', 'John', 'Doe', 'john@example.com', '+33123456789', 'Photographe professionnel', 'Paris, France'),
    ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce470b22', 'client', 'Jane', 'Smith', 'jane@example.com', '+33987654321', 'Passionnée de photographie', 'Lyon, France')
ON CONFLICT (id) DO NOTHING;

-- Insert sample working hours
INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_active) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, '09:00:00', '17:00:00', true)
ON CONFLICT DO NOTHING;

-- Insert sample offers
INSERT INTO offers (professional_id, title, description, price, duration, category) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Portrait', 'Séance photo portrait professionnel', 150.00, '1h', 'portrait'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Couple', 'Séance photo pour couples', 200.00, '1h30', 'couple'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Famille', 'Séance photo familiale', 250.00, '2h', 'famille')
ON CONFLICT DO NOTHING;
