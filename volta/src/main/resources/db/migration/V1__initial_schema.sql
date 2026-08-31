-- Create users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL
);

-- Create equipment table
CREATE TABLE equipment (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  hours INTEGER NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  supplier_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  category CHAR(1),
  declared_condition VARCHAR(255) NOT NULL,
  price_per_day NUMERIC(10, 2),
  tier VARCHAR(50) NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create quote_requests table
CREATE TABLE quote_requests (
  id VARCHAR(255) PRIMARY KEY,
  reference VARCHAR(255) NOT NULL UNIQUE,
  equipment_id VARCHAR(255) NOT NULL,
  supplier_id VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_company VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  requested_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (supplier_id) REFERENCES users(id)
);

-- Create checklist_items table
CREATE TABLE checklist_items (
  id VARCHAR(255) PRIMARY KEY,
  section VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  result VARCHAR(50),
  observation TEXT,
  inspection_id VARCHAR(255)
);

-- Create inspections table
CREATE TABLE inspections (
  id VARCHAR(255) PRIMARY KEY,
  quote_request_id VARCHAR(255) NOT NULL,
  equipment_id VARCHAR(255) NOT NULL,
  technical_team_id VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (technical_team_id) REFERENCES users(id)
);

-- Add foreign key for checklist_items
ALTER TABLE checklist_items ADD FOREIGN KEY (inspection_id) REFERENCES inspections(id);

-- Create reports table
CREATE TABLE reports (
  id VARCHAR(255) PRIMARY KEY,
  inspection_id VARCHAR(255) NOT NULL,
  equipment_id VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Create notifications table
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_supplier ON equipment(supplier_id);
CREATE INDEX idx_equipment_tier ON equipment(tier);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_supplier ON quote_requests(supplier_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_technical_team ON inspections(technical_team_id);
CREATE INDEX idx_notifications_role ON notifications(role);
