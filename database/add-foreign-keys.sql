-- Add Foreign Key Constraints - Run AFTER schema-basic.sql
-- Run this SQL in your Supabase SQL Editor AFTER running schema-basic.sql

-- Add foreign key constraints to offers table
ALTER TABLE offers ADD CONSTRAINT fk_offers_professional_id 
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to working_hours table
ALTER TABLE working_hours ADD CONSTRAINT fk_working_hours_professional_id 
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to blocked_dates table
ALTER TABLE blocked_dates ADD CONSTRAINT fk_blocked_dates_professional_id 
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to reservations table
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_client_id 
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_professional_id 
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_offer_id 
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;

-- Add foreign key constraints to portfolio table
ALTER TABLE portfolio ADD CONSTRAINT fk_portfolio_professional_id 
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to google_calendar_settings table
ALTER TABLE google_calendar_settings ADD CONSTRAINT fk_google_calendar_settings_professional_id 
    FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to notifications table
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to payments table
ALTER TABLE payments ADD CONSTRAINT fk_payments_reservation_id 
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
