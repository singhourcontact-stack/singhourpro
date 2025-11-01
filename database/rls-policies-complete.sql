-- RLS Policies for Your Existing Database Structure - COMPLETE VERSION
-- Run this to add security to your existing tables

-- SECTION 1: Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- SECTION 2: Create RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- SECTION 3: Create RLS Policies for offers table
CREATE POLICY "Users can view all active offers" ON offers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can manage their own offers" ON offers
    FOR ALL USING (auth.uid() = professional_id);

-- SECTION 4: Create RLS Policies for services table (your services table)
CREATE POLICY "Users can view all services" ON services
    FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their own services" ON services
    FOR ALL USING (auth.uid() = pro_id);

-- SECTION 5: Create RLS Policies for working_hours table
CREATE POLICY "Professionals can manage their own working hours" ON working_hours
    FOR ALL USING (auth.uid() = professional_id);

-- SECTION 6: Create RLS Policies for blocked_dates table
CREATE POLICY "Professionals can manage their own blocked dates" ON blocked_dates
    FOR ALL USING (auth.uid() = professional_id);

-- SECTION 7: Create RLS Policies for reservations table
CREATE POLICY "Users can view their own reservations" ON reservations
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = pro_id);

CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Professionals can update their reservations" ON reservations
    FOR UPDATE USING (auth.uid() = pro_id);

-- SECTION 8: Create RLS Policies for portfolio table
CREATE POLICY "Users can view all portfolio items" ON portfolio
    FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their own portfolio" ON portfolio
    FOR ALL USING (auth.uid() = professional_id);

-- SECTION 9: Create RLS Policies for google_calendar_settings table
CREATE POLICY "Professionals can manage their own calendar settings" ON google_calendar_settings
    FOR ALL USING (auth.uid() = professional_id);

-- SECTION 10: Create RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- SECTION 11: Create RLS Policies for payments table
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT client_id FROM reservations WHERE id = reservation_id
            UNION
            SELECT pro_id FROM reservations WHERE id = reservation_id
        )
    );

-- SECTION 12: Insert sample data for testing (WITH CORRECT ENUM VALUES)
INSERT INTO profiles (id, role, prenom, nom, email, telephone, adresse, societe, photo_url) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'professionnel', 'John', 'Doe', 'john@example.com', '+33123456789', 'Paris, France', 'John Doe Photography', 'https://example.com/avatar1.jpg'),
    ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce470b22', 'client', 'Jane', 'Smith', 'jane@example.com', '+33987654321', 'Lyon, France', 'Jane Smith Studio', 'https://example.com/avatar2.jpg')
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

-- Services table with CORRECT enum values
INSERT INTO services (pro_id, titre, description, tarif, type, photo_url) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Photo Studio', 'Séance photo en studio professionnel', 150.00, 'studio', 'https://example.com/studio.jpg'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Photographe Événement', 'Photographe pour événements et mariages', 200.00, 'photographe', 'https://example.com/event.jpg'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Réalisateur Vidéo', 'Réalisation de vidéos professionnelles', 300.00, 'realisateur', 'https://example.com/video.jpg')
ON CONFLICT DO NOTHING;
