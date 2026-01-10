-- V1__Initial_schema_baseline.sql
-- This migration establishes the baseline for the employee management module
-- Run this only on existing databases to baseline the flyway history

-- The users table already exists with the current schema
-- This migration ensures all new employee-specific columns are added

-- Add employee-specific columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS joining_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(50);

-- Create index on employee_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT', 'LEAVE')),
    leave_request_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- Create indexes on attendance table
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);

-- Create leave_request table
CREATE TABLE IF NOT EXISTS leave_request (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id),
    leave_type VARCHAR(10) NOT NULL CHECK (leave_type IN ('CL', 'SL', 'LOP')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(15) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_by BIGINT REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT
);

-- Create indexes on leave_request table
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_request(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_request(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_request(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_employee_status ON leave_request(employee_id, status);

-- Create leave_balance table
CREATE TABLE IF NOT EXISTS leave_balance (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id),
    leave_type VARCHAR(10) NOT NULL CHECK (leave_type IN ('CL', 'SL', 'LOP')),
    total INT NOT NULL DEFAULT 0,
    used INT NOT NULL DEFAULT 0,
    remaining INT NOT NULL DEFAULT 0,
    year INT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);

-- Create index on leave_balance table
CREATE INDEX IF NOT EXISTS idx_leave_balance_employee ON leave_balance(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balance_year ON leave_balance(year);

-- Add foreign key from attendance to leave_request
ALTER TABLE attendance 
    ADD CONSTRAINT fk_attendance_leave_request 
    FOREIGN KEY (leave_request_id) REFERENCES leave_request(id)
    ON DELETE SET NULL;
