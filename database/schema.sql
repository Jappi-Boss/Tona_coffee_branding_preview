-- Tona Coffee database schema snapshot
-- Source: live Neon project `tona-coffee-admin`, public schema
-- Snapshot date: 2026-09-05
--
-- This file intentionally excludes Neon-managed `neon_auth` tables, row data,
-- credentials, and secrets. It records the application-owned public schema so
-- database structure is versioned with the application code.

CREATE SEQUENCE IF NOT EXISTS public.tona_order_number_seq
  AS bigint
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  NO MAXVALUE
  NO CYCLE;

CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  email text PRIMARY KEY,
  display_name text,
  role text NOT NULL DEFAULT 'admin',
  is_permanent boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_allowlist_role_check
    CHECK (role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'editor'::text]))
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  region text NOT NULL,
  process text NOT NULL,
  description text NOT NULL DEFAULT '',
  tasting_notes text[] NOT NULL DEFAULT '{}'::text[],
  altitude text,
  image_url text,
  status text NOT NULL DEFAULT 'draft',
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  grind text NOT NULL,
  sku text,
  price numeric(12,2),
  stock_quantity integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_product_id_size_grind_key UNIQUE (product_id, size, grind),
  CONSTRAINT product_variants_stock_quantity_check CHECK (stock_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  capacity integer,
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',
  registration_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_capacity_check CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT events_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'cancelled'::text, 'completed'::text]))
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  guest_count integer NOT NULL DEFAULT 1,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_registrations_guest_count_check CHECK (guest_count >= 1 AND guest_count <= 10),
  CONSTRAINT event_registrations_status_check
    CHECK (status = ANY (ARRAY['new'::text, 'confirmed'::text, 'attended'::text, 'cancelled'::text]))
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT (
    'TONA-'::text || to_char(now(), 'YYYY'::text) || '-'::text ||
    lpad(nextval('public.tona_order_number_seq'::regclass)::text, 6, '0'::text)
  ),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  channel text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  total_amount numeric(12,2),
  customer_notes text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_channel_check
    CHECK (channel = ANY (ARRAY['website'::text, 'whatsapp'::text, 'admin'::text])),
  CONSTRAINT orders_status_check
    CHECK (status = ANY (ARRAY['new'::text, 'confirmed'::text, 'processing'::text, 'completed'::text, 'cancelled'::text]))
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  size text NOT NULL,
  grind text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS public.business_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text,
  business_type text,
  coffee_interest text,
  estimated_quantity text,
  message text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_inquiries_status_check
    CHECK (status = ANY (ARRAY['new'::text, 'contacted'::text, 'qualified'::text, 'closed'::text, 'lost'::text]))
);

CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  organization text,
  phone text NOT NULL,
  email text,
  request_type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_requests_status_check
    CHECK (status = ANY (ARRAY['new'::text, 'in_progress'::text, 'resolved'::text, 'spam'::text]))
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_idx
  ON public.audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS products_status_sort_idx
  ON public.products (status, sort_order);

CREATE INDEX IF NOT EXISTS variants_product_idx
  ON public.product_variants (product_id);

CREATE INDEX IF NOT EXISTS events_status_date_idx
  ON public.events (status, event_date);

CREATE INDEX IF NOT EXISTS registrations_created_idx
  ON public.event_registrations (created_at DESC);

CREATE INDEX IF NOT EXISTS registrations_event_status_idx
  ON public.event_registrations (event_id, status);

CREATE INDEX IF NOT EXISTS orders_status_created_idx
  ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS order_items_order_idx
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS business_inquiries_status_created_idx
  ON public.business_inquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_requests_status_created_idx
  ON public.contact_requests (status, created_at DESC);
