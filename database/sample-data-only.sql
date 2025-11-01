-- Sample Data Only - Test if tables exist
-- Run this to test if your tables are properly created

-- Test profiles table
INSERT INTO profiles (id, role, prenom, nom, email, telephone, bio, location) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'professionnel', 'John', 'Doe', 'john@example.com', '+33123456789', 'Photographe professionnel', 'Paris, France'),
    ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce470b22', 'client', 'Jane', 'Smith', 'jane@example.com', '+33987654321', 'Passionnée de photographie', 'Lyon, France')
ON CONFLICT (id) DO NOTHING;

-- Test working_hours table
INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_active) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, '09:00:00', '17:00:00', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, '09:00:00', '17:00:00', true)
ON CONFLICT DO NOTHING;

-- Test offers table
INSERT INTO offers (professional_id, title, description, price, duration, category) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Portrait', 'Séance photo portrait professionnel', 150.00, '1h', 'portrait'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Couple', 'Séance photo pour couples', 200.00, '1h30', 'couple'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Séance Famille', 'Séance photo familiale', 250.00, '2h', 'famille')
ON CONFLICT DO NOTHING;
