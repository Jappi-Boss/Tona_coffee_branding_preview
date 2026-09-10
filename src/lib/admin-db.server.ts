import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH_JWKS_URL =
  process.env.NEON_AUTH_JWKS_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json";

const jwks = createRemoteJWKSet(new URL(AUTH_JWKS_URL));

const NEON_AUTH_URL =
  process.env.NEON_AUTH_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}

async function requireAdmin(token: string) {
  const { payload } = await jwtVerify(token, jwks);
  if (!payload.sub) throw new Error("Invalid admin session.");

  const sql = database();
  const rows = await sql`
    SELECT u.email, u.name, a.role
    FROM neon_auth."user" u
    JOIN public.admin_allowlist a ON lower(a.email) = lower(u.email)
    WHERE u.id = ${payload.sub}::uuid
      AND a.is_active = true
      AND COALESCE(u.banned, false) = false
    LIMIT 1
  `;

  if (!rows[0])
    throw new Error("This account is not authorized for the Tona dashboard.");
  return {
    email: String(rows[0].email),
    name: String(rows[0].name ?? "Admin"),
    role: String(rows[0].role),
  };
}

async function requireSuperAdmin(token: string) {
  const admin = await requireAdmin(token);
  if (admin.role !== "super_admin")
    throw new Error("Only a super admin can manage dashboard users.");
  // Neon Auth's Admin plugin checks its own role claim. Keep it aligned with
  // the application's durable super-admin allowlist before admin operations.
  await database()`
    UPDATE neon_auth."user" u
    SET role = 'admin'
    FROM public.admin_allowlist a
    WHERE lower(a.email) = lower(u.email)
      AND lower(a.email) = lower(${admin.email})
      AND a.role = 'super_admin'
      AND COALESCE(u.role, '') <> 'admin'
  `;
  return admin;
}

function hexDigest(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function loadDashboard(token: string) {
  const admin = await requireAdmin(token);
  const sql = database();
  const [
    products,
    events,
    registrations,
    orders,
    businessInquiries,
    contactRequests,
  ] = await Promise.all([
    sql`SELECT p.*, COUNT(v.id)::int AS variant_count FROM products p LEFT JOIN product_variants v ON v.product_id = p.id GROUP BY p.id ORDER BY p.sort_order, p.name`,
    sql`SELECT e.*, COUNT(r.id)::int AS registration_count FROM events e LEFT JOIN event_registrations r ON r.event_id = e.id GROUP BY e.id ORDER BY e.event_date DESC`,
    sql`SELECT r.*, e.title AS event_title FROM event_registrations r JOIN events e ON e.id = r.event_id ORDER BY r.created_at DESC LIMIT 200`,
    sql`SELECT o.*, COALESCE(json_agg(json_build_object('productName', i.product_name, 'size', i.size, 'grind', i.grind, 'quantity', i.quantity, 'unitPrice', i.unit_price)) FILTER (WHERE i.id IS NOT NULL), '[]') AS items FROM orders o LEFT JOIN order_items i ON i.order_id = o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`,
    sql`SELECT * FROM business_inquiries ORDER BY created_at DESC LIMIT 200`,
    sql`SELECT * FROM contact_requests ORDER BY created_at DESC LIMIT 200`,
  ]);

  let users: Awaited<ReturnType<typeof listManagedUsers>> = [];
  if (admin.role === "super_admin") {
    users = await listManagedUsers();
  }

  return {
    admin,
    products,
    events,
    registrations,
    orders,
    businessInquiries,
    contactRequests,
    users,
  };
}

async function listManagedUsers() {
  return database()`
    SELECT
      u.id,
      a.email,
      COALESCE(a.display_name, u.name, 'User') AS name,
      a.role,
      a.is_permanent,
      (a.is_active AND NOT COALESCE(u.banned, false)) AS is_active,
      COALESCE(a.created_at, u."createdAt") AS created_at
    FROM public.admin_allowlist a
    LEFT JOIN neon_auth."user" u ON lower(u.email) = lower(a.email)
    ORDER BY a.created_at DESC
  `;
}

type CreateManagedUserInput = {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

export async function createManagedUser(input: CreateManagedUserInput) {
  const actor = await requireSuperAdmin(input.token);
  const email = input.email.trim().toLowerCase();
  const sql = database();
  const authUser = await sql`
    SELECT id, email
    FROM neon_auth."user"
    WHERE id = ${input.userId}::uuid AND lower(email) = lower(${email})
    LIMIT 1
  `;
  if (!authUser[0])
    throw new Error("The newly created Neon Auth user could not be verified.");
  await sql`
    INSERT INTO public.admin_allowlist
      (email, display_name, role, is_permanent, is_active)
    VALUES
      (${email}, ${input.name.trim()}, ${input.role}, false, true)
    ON CONFLICT (email) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      role = EXCLUDED.role,
      is_active = true,
      updated_at = now()
  `;

  await sql`
    INSERT INTO audit_log (actor_email, action, entity_type, entity_id, details)
    VALUES (${actor.email}, 'created', 'admin_user', ${input.userId}, ${JSON.stringify({ email, role: input.role })}::jsonb)
  `;
  return { ok: true };
}

type ResetManagedUserPasswordInput = {
  token: string;
  userId: string;
};

export async function resetManagedUserPassword(
  input: ResetManagedUserPasswordInput,
) {
  await requireSuperAdmin(input.token);
  const sql = database();
  const target = await sql`
    SELECT a.email, a.is_permanent, a.is_active
    FROM public.admin_allowlist a
    JOIN neon_auth."user" u ON lower(u.email) = lower(a.email)
    WHERE u.id = ${input.userId}::uuid
    LIMIT 1
  `;
  if (!target[0]) throw new Error("That dashboard user was not found.");
  if (target[0]["is_permanent"])
    throw new Error("The permanent super-admin password cannot be reset here.");
  if (!target[0]["is_active"])
    throw new Error("That dashboard user is inactive.");
  return { ok: true };
}

export async function recordManagedUserPasswordReset(
  input: ResetManagedUserPasswordInput,
) {
  const actor = await requireSuperAdmin(input.token);
  const sql = database();
  await sql`
    INSERT INTO audit_log (actor_email, action, entity_type, entity_id)
    VALUES (${actor.email}, 'password_reset', 'admin_user', ${input.userId})
  `;
  return { ok: true };
}

export async function createCloudinaryUploadSignature(token: string) {
  await requireAdmin(token);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "tkiiddxu";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret)
    throw new Error(
      "Cloudinary upload is not configured. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server environment.",
    );

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "tona/products";
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = hexDigest(
    await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(signatureBase),
    ),
  );
  return { cloudName, apiKey, timestamp, folder, signature };
}

type StatusChange = {
  token: string;
  entity:
    | "orders"
    | "event_registrations"
    | "business_inquiries"
    | "contact_requests";
  id: string;
  status: string;
};

const allowedStatuses: Record<StatusChange["entity"], string[]> = {
  orders: ["new", "confirmed", "processing", "completed", "cancelled"],
  event_registrations: ["new", "confirmed", "attended", "cancelled"],
  business_inquiries: ["new", "contacted", "qualified", "closed", "lost"],
  contact_requests: ["new", "in_progress", "resolved", "spam"],
};

export async function changeRecordStatus(input: StatusChange) {
  const admin = await requireAdmin(input.token);
  if (!allowedStatuses[input.entity].includes(input.status))
    throw new Error("Unsupported status.");
  const sql = database();

  if (input.entity === "orders") {
    await sql`UPDATE orders SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "event_registrations") {
    await sql`UPDATE event_registrations SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "business_inquiries") {
    await sql`UPDATE business_inquiries SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  } else {
    await sql`UPDATE contact_requests SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  }

  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id, details) VALUES (${admin.email}, 'status_changed', ${input.entity}, ${input.id}, ${JSON.stringify({ status: input.status })}::jsonb)`;
  return { ok: true };
}

type ProductUpdate = {
  token: string;
  id?: string;
  name: string;
  region: string;
  process: string;
  description: string;
  tastingNotes: string[];
  altitude: string | null;
  imageUrl: string | null;
  status: "draft" | "published" | "archived";
  isAvailable: boolean;
  isFeatured: boolean;
};

export async function upsertProduct(input: ProductUpdate) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  let id = input.id;
  if (id) {
    const rows =
      await sql`UPDATE products SET name = ${input.name}, region = ${input.region}, process = ${input.process}, description = ${input.description}, tasting_notes = ${input.tastingNotes}, altitude = ${input.altitude}, image_url = ${input.imageUrl}, status = ${input.status}, is_available = ${input.isAvailable}, is_featured = ${input.isFeatured}, updated_at = now() WHERE id = ${id}::uuid RETURNING id`;
    if (!rows[0])
      throw new Error(
        "This product no longer exists. Refresh the dashboard and try again.",
      );
    id = String(rows[0].id);
  } else {
    const slug = `${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-6)}`;
    const rows =
      await sql`INSERT INTO products (slug, name, region, process, description, tasting_notes, altitude, image_url, status, is_available, is_featured, sort_order) VALUES (${slug}, ${input.name}, ${input.region}, ${input.process}, ${input.description}, ${input.tastingNotes}, ${input.altitude}, ${input.imageUrl}, ${input.status}, ${input.isAvailable}, ${input.isFeatured}, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products)) RETURNING id`;
    id = String(rows[0].id);
  }
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'saved', 'product', ${id})`;
  return { ok: true, id, imageUrl: input.imageUrl };
}

type EventUpdate = {
  token: string;
  id?: string;
  title: string;
  summary: string;
  description: string;
  eventDate: string;
  location: string;
  capacity: number | null;
  coverImageUrl: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  registrationOpen: boolean;
};

export async function upsertEvent(input: EventUpdate) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  let id = input.id;
  if (id) {
    await sql`UPDATE events SET title = ${input.title}, summary = ${input.summary}, description = ${input.description}, event_date = ${input.eventDate}::timestamptz, location = ${input.location}, capacity = ${input.capacity}, cover_image_url = ${input.coverImageUrl}, status = ${input.status}, registration_open = ${input.registrationOpen}, updated_at = now() WHERE id = ${id}::uuid`;
  } else {
    const slug = `${input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-6)}`;
    const rows =
      await sql`INSERT INTO events (slug, title, summary, description, event_date, location, capacity, cover_image_url, status, registration_open) VALUES (${slug}, ${input.title}, ${input.summary}, ${input.description}, ${input.eventDate}::timestamptz, ${input.location}, ${input.capacity}, ${input.coverImageUrl}, ${input.status}, ${input.registrationOpen}) RETURNING id`;
    id = String(rows[0].id);
  }
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'saved', 'event', ${id})`;
  return { ok: true };
}

type DeleteInput = {
  token: string;
  entity:
    | "products"
    | "events"
    | "orders"
    | "event_registrations"
    | "business_inquiries"
    | "contact_requests";
  id: string;
};

export async function deleteRecord(input: DeleteInput) {
  const admin = await requireAdmin(input.token);
  const sql = database();

  if (input.entity === "events") {
    const rows =
      await sql`SELECT COUNT(*)::int AS count FROM event_registrations WHERE event_id = ${input.id}::uuid`;
    if (Number(rows[0]?.count ?? 0) > 0)
      throw new Error(
        "This event has registrations. Cancel or complete it instead of deleting it.",
      );
    await sql`DELETE FROM events WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "products") {
    await sql`DELETE FROM products WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "orders") {
    await sql`DELETE FROM orders WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "event_registrations") {
    await sql`DELETE FROM event_registrations WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "business_inquiries") {
    await sql`DELETE FROM business_inquiries WHERE id = ${input.id}::uuid`;
  } else {
    await sql`DELETE FROM contact_requests WHERE id = ${input.id}::uuid`;
  }

  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'deleted', ${input.entity}, ${input.id})`;
  return { ok: true };
}
