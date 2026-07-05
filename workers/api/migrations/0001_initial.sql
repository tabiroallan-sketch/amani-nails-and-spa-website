-- Migration 0001: Initial schema
-- Applied via: npx wrangler d1 migrations apply amani-spa

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL,
  price_kes INTEGER NOT NULL,
  image_url TEXT,
  available INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  services_offered TEXT,
  available INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS availability (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  date TEXT NOT NULL,
  slots TEXT NOT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  service_ids TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  staff_id TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  confirmation_token TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
