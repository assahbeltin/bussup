-- Seed Data DML for BusUp Supabase Database

-- 1. Seed Users
INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at) VALUES
('usr-admin-1', 'System Admin', 'admin@busup.com', '+237654321000', '$2a$10$fV2Bvg57R6nIu8lXyL7Cbe33oH/1J3yLh44D2H.qE8gG53F1H5H7O', 'admin', NOW()),
('usr-pass-1', 'Jean Dupont', 'jean@example.com', '+237654123456', '$2a$10$E5z0O18eP210C1vL8N3JCe33oH/1J3yLh44D2H.qE8gG53F1H5H7O', 'passenger', NOW()),
('usr-pass-2', 'Marie Sissoko', 'marie@example.com', '+237699887766', '$2a$10$E5z0O18eP210C1vL8N3JCe33oH/1J3yLh44D2H.qE8gG53F1H5H7O', 'passenger', NOW());

-- 2. Seed Cities
INSERT INTO cities (id, name, region) VALUES
('city-douala', 'Douala', 'Littoral'),
('city-yaounde', 'Yaoundé', 'Centre'),
('city-bamenda', 'Bamenda', 'North West'),
('city-bafoussam', 'Bafoussam', 'West'),
('city-kribi', 'Kribi', 'South'),
('city-garoua', 'Garoua', 'North'),
('city-maroua', 'Maroua', 'Far North');

-- 3. Seed Terminals
INSERT INTO terminals (id, city_id, name, address) VALUES
('term-dla-1', 'city-douala', 'Village Carrefour Terminal', 'Carrefour Village, Douala'),
('term-dla-2', 'city-douala', 'Akwa Agency Terminal', 'Boulevard de la Liberté, Akwa'),
('term-dla-3', 'city-douala', 'Vatican Express Akwa Terminal', 'Akwa Centre, Douala'),
('term-yde-1', 'city-yaounde', 'Mvan Terminal', 'Mvan, Yaoundé'),
('term-yde-2', 'city-yaounde', 'Vatican Express Terminal', 'Mvan Agency, Yaoundé'),
('term-bda-1', 'city-bamenda', 'Vatican Main Station', 'Commercial Avenue, Bamenda'),
('term-bda-2', 'city-bamenda', 'Up Station Bus Terminal', 'Up Station, Bamenda'),
('term-bfm-1', 'city-bafoussam', 'Marché A Terminal', 'Centre Ville, Bafoussam'),
('term-krb-1', 'city-kribi', 'Kribi Central Station', 'Beachfront Road, Kribi'),
('term-gra-1', 'city-garoua', 'Garoua Main Station', 'Avenue de la Gare, Garoua'),
('term-mra-1', 'city-maroua', 'Maroua Central Terminal', 'Grand Marché, Maroua');

-- 4. Seed Buses
INSERT INTO buses (id, agency_name, bus_number, type, total_seats, driver_name, status, current_route) VALUES
('BUS-VAT-101', 'Vatican Express', 'NW-881-VAT', 'VIP Classic (A/C, WiFi)', 80, 'Tanjong Pius', 'Available', 'Yaoundé → Bamenda'),
('BUS-VAT-102', 'Vatican Express', 'NW-402-VAT', 'Standard Comfort', 80, 'Che Felix', 'Available', 'Yaoundé → Bamenda'),
('BUS-VAT-103', 'Vatican Express', 'NW-915-VAT', 'Premium VIP', 80, 'Ngu Edward', 'On Route', 'Yaoundé → Douala'),
('BUS-VAT-104', 'Vatican Express', 'NW-334-VAT', 'Executive Direct', 80, 'Fuh Collins', 'Available', 'Yaoundé → Bafoussam'),
('BUS-101', 'General Express', 'LT-892-AB', 'VIP Classic (A/C, WiFi)', 80, 'Samuel Eto', 'On Route', 'Douala → Yaoundé'),
('BUS-102', 'Touristique Express', 'CE-451-XY', 'Executive Direct', 80, 'Franck Kessie', 'On Route', 'Bafoussam → Douala');

-- 5. Seed Trips
INSERT INTO trips (id, bus_id, agency_name, rating, reviews_count, from_city, from_terminal, to_city, to_terminal, departure_time, arrival_time, duration, bus_type, price_fcfa, price_formatted, journey_shift, amenities) VALUES
('TRIP-VAT-1', 'BUS-VAT-101', 'Vatican Express', 4.9, 186, 'Yaoundé', 'Vatican Express Terminal', 'Bamenda', 'Vatican Main Station', '07:30 AM', '01:30 PM', '6h 00m', 'VIP Luxury Line (A/C, WiFi, Snacks)', 8000, 'FCFA 8,000', 'Morning', ARRAY['Air Conditioning', 'Free WiFi', 'Power Outlets', 'Reclining Seats', 'Snacks']),
('TRIP-VAT-2', 'BUS-VAT-102', 'Vatican Express', 4.6, 94, 'Yaoundé', 'Mvan Terminal', 'Bamenda', 'Vatican Main Station', '09:00 AM', '03:30 PM', '6h 30m', 'Standard Classic', 6000, 'FCFA 6,000', 'Morning', ARRAY['Reclining Seats', 'Sound System', 'Luggage Space']),
('TRIP-VAT-3', 'BUS-VAT-103', 'Vatican Express', 4.8, 210, 'Yaoundé', 'Vatican Express Terminal', 'Douala', 'Vatican Express Akwa Terminal', '08:00 AM', '12:15 PM', '4h 15m', 'VIP Classic (A/C, WiFi)', 7000, 'FCFA 7,000', 'Morning', ARRAY['Air Conditioning', 'Free WiFi', 'Power Outlets', 'Reclining Seats']),
('TRIP-VAT-4', 'BUS-VAT-102', 'Vatican Express', 4.5, 112, 'Yaoundé', 'Mvan Terminal', 'Douala', 'Village Carrefour Terminal', '02:00 PM', '06:30 PM', '4h 30m', 'Standard Classic', 5000, 'FCFA 5,000', 'Afternoon', ARRAY['Air Conditioning', 'Reclining Seats']),
('TRIP-VAT-5', 'BUS-VAT-101', 'Vatican Express', 4.9, 145, 'Yaoundé', 'Vatican Express Terminal', 'Bamenda', 'Vatican Main Station', '08:30 PM', '03:00 AM', '6h 30m', 'VIP Night Express', 8500, 'FCFA 8,500', 'Night', ARRAY['Air Conditioning', 'Free WiFi', 'Blankets', 'Reclining Seats']),
('TRIP-VAT-6', 'BUS-VAT-103', 'Vatican Express', 4.7, 130, 'Douala', 'Vatican Express Akwa Terminal', 'Yaoundé', 'Vatican Express Terminal', '07:30 AM', '11:45 AM', '4h 15m', 'VIP Classic (A/C, WiFi)', 7000, 'FCFA 7,000', 'Morning', ARRAY['Air Conditioning', 'Free WiFi', 'Power Outlets', 'Reclining Seats']),
('TRIP-VAT-7', 'BUS-VAT-104', 'Vatican Express', 4.6, 78, 'Yaoundé', 'Mvan Terminal', 'Bafoussam', 'Marché A Terminal', '10:00 AM', '02:30 PM', '4h 30m', 'Executive Direct', 5500, 'FCFA 5,500', 'Morning', ARRAY['Air Conditioning', 'Reclining Seats']);

-- 6. Seed Bookings
INSERT INTO bookings (id, ticket_no, user_id, trip_id, agency_name, from_city, from_terminal, to_city, to_terminal, departure_time, arrival_time, departure_date, seat_ids, total_amount_fcfa, total_amount_formatted, status, payment_method, payment_status, payment_phone_or_card, qr_payload, created_at) VALUES
('bk-001', '#TRV-98210', 'usr-pass-1', 'TRIP-1', 'General Express', 'Douala', 'Village Carrefour Terminal', 'Yaoundé', 'Mvan Terminal', '08:00 AM', '12:30 PM', 'Today', ARRAY['14A', '14B'], 12000, '12,000 FCFA', 'Confirmed', 'MTN', 'COMPLETED', '654123456', 'BUSUP:TRV-98210:TRIP-1:SEATS:14A,14B', NOW()),
('bk-002', '#TRV-89215', 'usr-pass-2', 'TRIP-5', 'Touristique Express', 'Yaoundé', 'Mvan Terminal', 'Kribi', 'Kribi Central Station', '06:00 AM', '10:00 AM', 'Tomorrow', ARRAY['2C'], 6500, '6,500 FCFA', 'Processing', 'ORANGE', 'COMPLETED', '699887766', 'BUSUP:TRV-89215:TRIP-5:SEATS:2C', NOW());

-- 7. Seed Passengers
INSERT INTO passengers (booking_id, seat_id, full_name, phone, email, age) VALUES
('bk-001', '14A', 'Jean Dupont', '654123456', 'jean@example.com', '28'),
('bk-001', '14B', 'Claire Dupont', '654123457', 'claire@example.com', '26'),
('bk-002', '2C', 'Marie Sissoko', '699887766', 'marie@example.com', '24');
