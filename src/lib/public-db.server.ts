import { neon } from "@neondatabase/serverless";
import { FORMATS, PRODUCTS, SIZES } from "./tona";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}

export async function loadPublicCatalog() {
  if (!process.env.DATABASE_URL) return fallbackCatalog();
  const sql = database();
  const [products, events] = await Promise.all([
    sql`
      SELECT
        p.id,
        p.slug,
        p.name,
        p.region,
        p.process,
        p.description,
        p.tasting_notes,
        p.altitude,
        p.image_url,
        p.is_available,
        p.is_featured,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'size', v.size,
              'grind', v.grind,
              'price', v.price,
              'stockQuantity', v.stock_quantity
            ) ORDER BY v.size, v.grind
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants v
        ON v.product_id = p.id AND v.is_active = true
      WHERE p.status = 'published' AND p.is_available = true
      GROUP BY p.id
      ORDER BY p.is_featured DESC, p.sort_order, p.name
    `,
    sql`
      SELECT
        e.id,
        e.slug,
        e.title,
        e.summary,
        e.description,
        e.event_date,
        e.location,
        e.capacity,
        e.cover_image_url,
        e.registration_open,
        COUNT(r.id)::int AS registration_count
      FROM events e
      LEFT JOIN event_registrations r
        ON r.event_id = e.id AND r.status <> 'cancelled'
      WHERE e.status = 'published'
      GROUP BY e.id
      ORDER BY e.event_date
    `,
  ]);

  return {
    products: products.map((product) => ({
      id: String(product.id),
      slug: String(product.slug),
      name: String(product.name),
      region: String(product.region),
      process: String(product.process),
      description: String(product.description ?? ""),
      tastingNotes: Array.isArray(product.tasting_notes)
        ? product.tasting_notes.map(String)
        : [],
      altitude: product.altitude ? String(product.altitude) : null,
      imageUrl: product.image_url ? String(product.image_url) : null,
      isAvailable: Boolean(product.is_available),
      isFeatured: Boolean(product.is_featured),
      variants: Array.isArray(product.variants)
        ? product.variants.map((variant: Record<string, unknown>) => ({
            id: String(variant.id),
            size: String(variant.size),
            grind: String(variant.grind),
            price: variant.price == null ? null : Number(variant.price),
            stockQuantity: Number(variant.stockQuantity ?? 0),
          }))
        : [],
    })),
    events: events.map((event) => ({
      id: String(event.id),
      slug: String(event.slug),
      title: String(event.title),
      summary: String(event.summary ?? ""),
      description: String(event.description ?? ""),
      eventDate: new Date(String(event.event_date)).toISOString(),
      location: String(event.location),
      capacity: event.capacity == null ? null : Number(event.capacity),
      coverImageUrl: event.cover_image_url
        ? String(event.cover_image_url)
        : null,
      registrationOpen: Boolean(event.registration_open),
      registrationCount: Number(event.registration_count ?? 0),
    })),
  };
}

function fallbackCatalog() {
  const productIds = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
    "44444444-4444-4444-8444-444444444444",
  ];
  const eventDates = ["2026-09-26T07:00:00.000Z", "2026-10-10T08:00:00.000Z"];

  return {
    products: PRODUCTS.map((product, productIndex) => ({
      id: productIds[productIndex]!,
      slug: product.slug,
      name: product.name,
      region: product.region,
      process: product.process,
      description: product.blurb,
      tastingNotes: product.notes,
      altitude: product.altitude,
      imageUrl: null,
      isAvailable: true,
      isFeatured: productIndex < 2,
      variants: SIZES.flatMap((size, sizeIndex) =>
        FORMATS.map((grind, grindIndex) => ({
          id: `${productIds[productIndex]!.slice(0, 24)}${String(sizeIndex + 1).padStart(2, "0")}${String(grindIndex + 1).padStart(2, "0")}1111`,
          size,
          grind,
          price: null,
          stockQuantity: 0,
        })),
      ),
    })),
    events: eventDates.map((eventDate, index) => ({
      id:
        index === 0
          ? "55555555-5555-4555-8555-555555555555"
          : "66666666-6666-4666-8666-666666666666",
      slug: index === 0 ? "tona-coffee-ceremony" : "origin-cupping",
      title:
        index === 0
          ? "Tona Coffee Ceremony Tasting"
          : "Ethiopian Origin Cupping",
      summary:
        index === 0
          ? "A shared Ethiopian coffee ceremony, selected origins and the spirit of the second round."
          : "Taste Tona's four Ethiopian origins side by side with our coffee team.",
      description:
        "An intimate Tona experience built around coffee, origin and conversation.",
      eventDate,
      location: "Bole, Addis Ababa",
      capacity: 30,
      coverImageUrl: null,
      registrationOpen: true,
      registrationCount: 0,
    })),
  };
}

export async function createEventRegistration(input: {
  eventId: string;
  fullName: string;
  phone: string;
  email: string | null;
  guestCount: number;
  notes: string | null;
}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO event_registrations
      (event_id, full_name, phone, email, guest_count, notes)
    SELECT
      e.id,
      ${input.fullName},
      ${input.phone},
      ${input.email},
      ${input.guestCount},
      ${input.notes}
    FROM events e
    WHERE e.id = ${input.eventId}::uuid
      AND e.status = 'published'
      AND e.registration_open = true
      AND (
        e.capacity IS NULL OR
        (SELECT COALESCE(SUM(r.guest_count), 0)
         FROM event_registrations r
         WHERE r.event_id = e.id AND r.status <> 'cancelled') + ${input.guestCount} <= e.capacity
      )
    RETURNING id
  `;
  if (!rows[0]) throw new Error("Registration is closed or the event is full.");
  return { ok: true, id: String(rows[0].id) };
}

export async function createBusinessInquiry(input: {
  organization: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  businessType: string | null;
  coffeeInterest: string | null;
  estimatedQuantity: string | null;
  message: string | null;
}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO business_inquiries
      (organization, contact_person, phone, email, business_type, coffee_interest, estimated_quantity, message)
    VALUES
      (${input.organization}, ${input.contactPerson}, ${input.phone}, ${input.email}, ${input.businessType}, ${input.coffeeInterest}, ${input.estimatedQuantity}, ${input.message})
    RETURNING id
  `;
  return { ok: true, id: String(rows[0].id) };
}

export async function createContactRequest(input: {
  fullName: string;
  organization: string | null;
  phone: string;
  email: string | null;
  requestType: string;
  message: string;
}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO contact_requests
      (full_name, organization, phone, email, request_type, message)
    VALUES
      (${input.fullName}, ${input.organization}, ${input.phone}, ${input.email}, ${input.requestType}, ${input.message})
    RETURNING id
  `;
  return { ok: true, id: String(rows[0].id) };
}

export async function createOrder(input: {
  productId: string;
  customerName: string;
  phone: string;
  email: string | null;
  size: string;
  grind: string;
  quantity: number;
  notes: string | null;
}) {
  const sql = database();
  const rows = await sql`
    WITH selected AS (
      SELECT p.id, p.name, v.price
      FROM products p
      LEFT JOIN product_variants v
        ON v.product_id = p.id
       AND v.size = ${input.size}
       AND v.grind = ${input.grind}
       AND v.is_active = true
      WHERE p.id = ${input.productId}::uuid
        AND p.status = 'published'
        AND p.is_available = true
      LIMIT 1
    ), new_order AS (
      INSERT INTO orders
        (customer_name, phone, email, channel, total_amount, customer_notes)
      SELECT
        ${input.customerName},
        ${input.phone},
        ${input.email},
        'website',
        CASE WHEN selected.price IS NULL THEN NULL ELSE selected.price * ${input.quantity} END,
        ${input.notes}
      FROM selected
      RETURNING id, order_number
    )
    INSERT INTO order_items
      (order_id, product_id, product_name, size, grind, quantity, unit_price)
    SELECT
      new_order.id,
      selected.id,
      selected.name,
      ${input.size},
      ${input.grind},
      ${input.quantity},
      selected.price
    FROM new_order, selected
    RETURNING
      order_id,
      (SELECT order_number FROM new_order) AS order_number
  `;
  if (!rows[0]) throw new Error("This product is not currently available.");
  return { ok: true, orderNumber: String(rows[0].order_number) };
}
