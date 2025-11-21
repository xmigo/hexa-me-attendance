-- Hexa-Me Database Initialization Script
-- Run this script to set up the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Sequelize will create tables automatically
-- This script is for reference and manual setup if needed

-- Create indexes for better performance
-- (Sequelize will handle table creation, but we can add indexes here)

-- Example: Create index on attendance records for faster queries
-- CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, timestamp);
-- CREATE INDEX IF NOT EXISTS idx_attendance_type ON attendance_records(type);
-- CREATE INDEX IF NOT EXISTS idx_location_user_time ON location_history(user_id, timestamp);

-- Create index on users for search
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

COMMENT ON DATABASE hexa_me IS 'Hexa-Me Attendance Management System Database';


