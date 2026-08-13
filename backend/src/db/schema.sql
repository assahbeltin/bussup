-- Schema DDL for BusUp Supabase Database

-- Drop existing tables in reverse dependency order if recreating
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS terminals CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
  id VARCHAR(100) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cities Table
CREATE TABLE cities (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL
);

-- 3. Terminals Table
CREATE TABLE terminals (
  id VARCHAR(100) PRIMARY KEY,
  city_id VARCHAR(100) REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL
);

-- 4. Buses Table
CREATE TABLE buses (
  id VARCHAR(100) PRIMARY KEY,
  agency_name VARCHAR(100) NOT NULL,
  bus_number VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  total_seats INT DEFAULT 80,
  driver_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'On Route', 'Maintenance')),
  current_route VARCHAR(255)
);

-- 5. Trips Table
CREATE TABLE trips (
  id VARCHAR(100) PRIMARY KEY,
  bus_id VARCHAR(100) REFERENCES buses(id) ON DELETE SET NULL,
  agency_name VARCHAR(100) NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  reviews_count INT DEFAULT 0,
  from_city VARCHAR(100) NOT NULL,
  from_terminal VARCHAR(255) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  to_terminal VARCHAR(255) NOT NULL,
  departure_time VARCHAR(50) NOT NULL,
  arrival_time VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  bus_type VARCHAR(100) NOT NULL,
  price_fcfa INT NOT NULL,
  price_formatted VARCHAR(50) NOT NULL,
  journey_shift VARCHAR(50) NOT NULL CHECK (journey_shift IN ('Morning', 'Afternoon', 'Night')),
  amenities TEXT[] DEFAULT '{}'
);

-- 6. Bookings Table
CREATE TABLE bookings (
  id VARCHAR(100) PRIMARY KEY,
  ticket_no VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  trip_id VARCHAR(100) REFERENCES trips(id) ON DELETE CASCADE,
  agency_name VARCHAR(100) NOT NULL,
  from_city VARCHAR(100) NOT NULL,
  from_terminal VARCHAR(255) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  to_terminal VARCHAR(255) NOT NULL,
  departure_time VARCHAR(50) NOT NULL,
  arrival_time VARCHAR(50) NOT NULL,
  departure_date VARCHAR(50) NOT NULL,
  seat_ids TEXT[] NOT NULL,
  total_amount_fcfa INT NOT NULL,
  total_amount_formatted VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Confirmed', 'Processing', 'Completed', 'Cancelled')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('MTN', 'ORANGE', 'CARD', 'ON_BOARD')),
  payment_status VARCHAR(50) NOT NULL CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED')),
  payment_phone_or_card VARCHAR(100),
  qr_payload TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Passengers Table
CREATE TABLE passengers (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(100) REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id VARCHAR(20) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  age VARCHAR(10) NOT NULL
);

-- Indexes for fast searches and foreign key queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trips_search ON trips(from_city, to_city, journey_shift);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_ticket ON bookings(ticket_no);
CREATE INDEX idx_terminals_city ON terminals(city_id);
