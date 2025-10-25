-- Minimal RLS Policies - No Column References
-- Run this AFTER sections 1-9 are successful

-- SECTION 10: Enable Row Level Security (run after all tables are created)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- SECTION 11: Create minimal RLS policies (no column references)
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Offers policies - allow all for now
CREATE POLICY "Allow all offers" ON offers
    FOR ALL USING (true);

-- Working hours policies - allow all for now
CREATE POLICY "Allow all working hours" ON working_hours
    FOR ALL USING (true);

-- Blocked dates policies - allow all for now
CREATE POLICY "Allow all blocked dates" ON blocked_dates
    FOR ALL USING (true);

-- Reservations policies - allow all for now
CREATE POLICY "Allow all reservations" ON reservations
    FOR ALL USING (true);

-- Portfolio policies - allow all for now
CREATE POLICY "Allow all portfolio" ON portfolio
    FOR ALL USING (true);

-- Google calendar settings policies - allow all for now
CREATE POLICY "Allow all calendar settings" ON google_calendar_settings
    FOR ALL USING (true);

-- Notifications policies - allow all for now
CREATE POLICY "Allow all notifications" ON notifications
    FOR ALL USING (true);

-- Payments policies - allow all for now
CREATE POLICY "Allow all payments" ON payments
    FOR ALL USING (true);

-- SECTION 12: Insert sample data (run after all tables and policies are created)
INSERT INTO profiles (id, role, prenom, nom, email, telephone, bio, location) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'professionnel', 'John', 'Doe', 'john@example.com', '+33123456789', 'Photographe professionnel', 'Paris, France'),
    ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce470b22', 'client', 'Jane', 'Smith', 'jane@example.com', '+33987654321', 'Passionnée de photographie', 'Lyon, France')
ON CONFLICT (id) DO NOTHING;

INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_active) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, '09:00:00', '17:00:00', true)
ON CONFLICT DO NOTHING;

INSERT INTO offers (professional_id, title, description, price, duration, category) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Portrait', 'Séance photo portrait professionnel', 150.00, '1h', 'portrait'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Couple', 'Séance photo pour couples', 200.00, '1h30', 'couple'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Famille', 'Séance photo familiale', 250.00, '2h', 'famille')
ON CONFLICT DO NOTHING;
