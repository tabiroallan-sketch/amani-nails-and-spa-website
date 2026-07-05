export type Bindings = {
  DB: D1Database;
  ASSETS: R2Bucket;
  KV: KVNamespace;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  AFRICASTALKING_API_KEY: string;
};

export type Variables = {
  validated?: Record<string, unknown>;
  requestId?: string;
};

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export type Service = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  duration_min: number;
  price_kes: number;
  image_url: string | null;
  available: number;
  order_index: number;
};

export type Staff = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  image_url: string | null;
  services_offered: string | null;
  available: number;
};

export type Customer = {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  notes: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  customer_id: string;
  service_ids: string;
  date: string;
  time: string;
  staff_id: string | null;
  status: BookingStatus;
  notes: string | null;
  confirmation_token: string;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
};
