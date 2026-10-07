-- =============================================================================
-- FindIT: College Lost & Found Management System
-- Database Initialization Script (PostgreSQL 16)
-- Schema: users, items, matches + Indexes + Seed Rows
-- =============================================================================

-- Drop tables if needed for clean re-runs
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
-- Stores student / faculty contact details for item reporters
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ITEMS TABLE
-- Stores lost and found item catalog with categorization, location, and metadata
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('LOST', 'FOUND')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLAIMED', 'CLOSED')),
    image_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MATCHES TABLE
-- Stores rule-based matching pairs where calculated score exceeds 60%
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    lost_item_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    found_item_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'POTENTIAL' CHECK (status IN ('POTENTIAL', 'CONFIRMED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_item_pair UNIQUE (lost_item_id, found_item_id)
);

-- Indexes for optimal querying in search and match pipelines
CREATE INDEX IF NOT EXISTS idx_items_type_status ON items(type, status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(location);
CREATE INDEX IF NOT EXISTS idx_matches_lost ON matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found ON matches(found_item_id);

-- =============================================================================
-- SEED DATA: Realistic college campus scenarios
-- =============================================================================

-- Insert Seed Users
INSERT INTO users (id, name, email, phone) VALUES
(1, 'Aarav Patel', 'aarav.patel@college.edu', '+91 98765 43210'),
(2, 'Priya Sharma', 'priya.sharma@college.edu', '+91 98234 56789'),
(3, 'Rohan Mehta', 'rohan.mehta@college.edu', '+91 97123 45678'),
(4, 'Ananya Iyer', 'ananya.iyer@college.edu', '+91 99887 76655');

-- Reset users sequence to avoid collision
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Insert Seed Items
-- Item 1: LOST Laptop
INSERT INTO items (id, user_id, title, category, description, location, date, type, status, image_url) VALUES
(1, 1, 'Black Dell Inspiron Laptop', 'Electronics', 'Black 15-inch laptop with React sticker on lid and Dell charger in navy bag.', 'Central Library 2nd Floor', '2026-10-01', 'LOST', 'ACTIVE', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop');

-- Item 2: FOUND Laptop (Matches Item 1 with >75% confidence)
INSERT INTO items (id, user_id, title, category, description, location, date, type, status, image_url) VALUES
(2, 2, 'Black Dell Laptop with charger', 'Electronics', 'Black Dell laptop discovered on study desk near reading section, includes navy bag and charger.', 'Central Library Reading Hall', '2026-10-02', 'FOUND', 'ACTIVE', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop');

-- Item 3: LOST ID Card
INSERT INTO items (id, user_id, title, category, description, location, date, type, status, image_url) VALUES
(3, 3, 'Computer Science Student ID Card', 'Documents', 'RFID ID card belonging to Rohan Mehta (Roll No. 2024CS042) in black lanyard.', 'Canteen Block A', '2026-10-03', 'LOST', 'ACTIVE', 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&auto=format&fit=crop');

-- Item 4: FOUND Water Bottle
INSERT INTO items (id, user_id, title, category, description, location, date, type, status, image_url) VALUES
(4, 4, 'Milton Insulated Steel Bottle', 'Accessories', 'Silver 1-litre Milton thermosteel water bottle found under bench.', 'Sports Complex Pavilion', '2026-10-04', 'FOUND', 'ACTIVE', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop');

-- Reset items sequence
SELECT setval('items_id_seq', (SELECT MAX(id) FROM items));

-- Insert Initial Calculated Match between Item 1 (LOST) and Item 2 (FOUND)
-- Category: 30%, Title: ~22.5%, Location: ~12.5%, Description: ~12% -> ~77%
INSERT INTO matches (lost_item_id, found_item_id, match_score, status) VALUES
(1, 2, 77.00, 'POTENTIAL')
ON CONFLICT (lost_item_id, found_item_id) DO NOTHING;
