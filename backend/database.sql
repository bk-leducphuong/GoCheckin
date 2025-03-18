-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better type safety
CREATE TYPE user_role_enum AS ENUM ('admin', 'tenant', 'poc');
CREATE TYPE identity_type_enum AS ENUM ('id_card', 'passport', 'driving_license', 'other');
CREATE TYPE event_status_enum AS ENUM ('draft', 'published', 'active', 'completed', 'cancelled');
CREATE TYPE device_status_enum AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE transaction_status_enum AS ENUM ('successful', 'failed', 'pending');
CREATE TYPE notification_type_enum AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE guest_type_enum AS ENUM ('regular', 'vip', 'speaker', 'exhibitor', 'sponsor');
CREATE TYPE point_status_enum AS ENUM ('active', 'inactive', 'maintenance');

-- Tenants table
CREATE TABLE tenants (
    tenant_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_code VARCHAR(50) NOT NULL UNIQUE,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_address TEXT NOT NULL,
    website VARCHAR(255),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    logo BYTEA,
    industry VARCHAR(100),
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    role user_role_enum NOT NULL,
    company_name VARCHAR(255),
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for Accounts to Tenants
CREATE TABLE accounts_to_tenants (
    user_id UUID NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, tenant_code),
    FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_code) REFERENCES tenants(tenant_code) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events Management table
CREATE TABLE events (
    event_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_code VARCHAR(50) NOT NULL UNIQUE,
    event_name VARCHAR(255) NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    event_description TEXT,
    event_status event_status_enum NOT NULL DEFAULT 'draft',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    event_img BYTEA,
    venue_name VARCHAR(255),
    venue_address TEXT,
    capacity INTEGER,
    event_type VARCHAR(100),
    terms_conditions TEXT,
    floor_plan_img BYTEA,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_code) REFERENCES tenants(tenant_code) ON DELETE RESTRICT
);

-- Guests table
CREATE TABLE guests (
    guest_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guest_code VARCHAR(50) NOT NULL UNIQUE,
    guest_description VARCHAR(255),
    front_img BYTEA,
    back_img BYTEA,
    identity_type identity_type_enum NOT NULL,
    guest_type guest_type_enum DEFAULT 'regular',
    age_range VARCHAR(20),
    gender VARCHAR(20),
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event Guests junction table
CREATE TABLE event_guests (
    event_code VARCHAR(50) NOT NULL,
    guest_code VARCHAR(50) NOT NULL,
    registration_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attendance_status BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (event_code, guest_code),
    FOREIGN KEY (event_code) REFERENCES events(event_code) ON DELETE CASCADE,
    FOREIGN KEY (guest_code) REFERENCES guests(guest_code) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Points of Checkin table
CREATE TABLE points_of_checkin (
    point_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    point_code VARCHAR(50) NOT NULL UNIQUE,
    point_name VARCHAR(255) NOT NULL,
    point_note TEXT,
    event_code VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    status point_status_enum DEFAULT 'active',
    open_time TIME,
    close_time TIME,
    location_description TEXT,
    floor_level VARCHAR(10),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_code) REFERENCES events(event_code) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES accounts(username) ON DELETE RESTRICT
);

-- Devices table
CREATE TABLE devices (
    device_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    point_code VARCHAR(50) NOT NULL,
    description TEXT,
    status device_status_enum DEFAULT 'active',
    last_connection TIMESTAMP,
    firmware_version VARCHAR(50),
    battery_level INTEGER,
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_code) REFERENCES points_of_checkin(point_code) ON DELETE RESTRICT
);

-- Transactions table
CREATE TABLE transactions (
    tran_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    point_code VARCHAR(50) NOT NULL,
    guest_code VARCHAR(50) NOT NULL,
    device_code VARCHAR(50) NOT NULL,
    transaction_status transaction_status_enum DEFAULT 'successful',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_time INTEGER, -- in milliseconds
    note TEXT,
    checkin_img1 BYTEA,
    checkin_img2 BYTEA,
    gender_analysis VARCHAR(10),
    age_analysis VARCHAR(20),
    metadata JSONB,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (point_code) REFERENCES points_of_checkin(point_code) ON DELETE RESTRICT,
    FOREIGN KEY (guest_code) REFERENCES guests(guest_code) ON DELETE RESTRICT,
    FOREIGN KEY (device_code) REFERENCES devices(device_code) ON DELETE RESTRICT
);

-- Notifications table
CREATE TABLE notifications (
    notification_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_id UUID NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    event_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES accounts(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_code) REFERENCES events(event_code) ON DELETE CASCADE
);

-- Audit log table
CREATE TABLE audit_logs (
    log_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE SET NULL
);

-- Analytics table for pre-calculated metrics
CREATE TABLE analytics (
    analytics_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_code VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    calculation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_code) REFERENCES events(event_code) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_guest_code ON transactions(guest_code);
CREATE INDEX idx_transactions_point_code ON transactions(point_code);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_events_tenant_code ON events(tenant_code);
CREATE INDEX idx_events_date_range ON events(start_time, end_time);
CREATE INDEX idx_points_event_code ON points_of_checkin(event_code);
CREATE INDEX idx_devices_point_code ON devices(point_code);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE is_read = FALSE;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_event_guests_event ON event_guests(event_code);
CREATE INDEX idx_analytics_event_metric ON analytics(event_code, metric_name, time_period);

-- Create functions for automatic update of updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for automatic update of updated_at columns
CREATE TRIGGER update_tenants_modtime
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_accounts_modtime
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_events_modtime
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_guests_modtime
BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_event_guests_modtime
BEFORE UPDATE ON event_guests
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_points_modtime
BEFORE UPDATE ON points_of_checkin
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_devices_modtime
BEFORE UPDATE ON devices
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
