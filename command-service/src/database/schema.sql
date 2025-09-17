-- Database Schema for Trail Race System
-- This file contains all table definitions and initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Applicant', 'Administrator')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Races table
CREATE TABLE IF NOT EXISTS races (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    distance VARCHAR(50) NOT NULL CHECK (distance IN ('5k', '10k', 'HalfMarathon', 'Marathon')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    club VARCHAR(255),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(race_id, user_id) -- Prevent duplicate applications
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_applications_race_id ON applications(race_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Insert sample data for testing
INSERT INTO users (id, email, password, first_name, last_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@trailrace.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.5K2', 'Admin', 'User', 'Administrator'),
    ('550e8400-e29b-41d4-a716-446655440002', 'applicant@trailrace.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.5K2', 'Applicant', 'User', 'Applicant')
ON CONFLICT (email) DO NOTHING;

-- Insert sample races
INSERT INTO races (id, name, distance) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'Spring Trail Run', '10k'),
    ('550e8400-e29b-41d4-a716-446655440011', 'Mountain Marathon', 'Marathon'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Forest 5K', '5k'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Half Trail Challenge', 'HalfMarathon')
ON CONFLICT DO NOTHING;

-- Insert sample applications
INSERT INTO applications (first_name, last_name, club, race_id, user_id) VALUES
    ('John', 'Doe', 'Running Club Zagreb', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002'),
    ('Jane', 'Smith', 'Trail Runners Split', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT DO NOTHING;
