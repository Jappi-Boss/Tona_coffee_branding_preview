import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const authInput = z.object({ token: z.string().min(20) });

const statusInput = authInput.extend({
  entity: z.enum([
    "orders",
    "event_registrations",
    "business_inquiries",
    "contact_requests",
  ]),
  id: z.string().uuid(),
  status: z.string().min(1).max(40),
});

const productInput = authInput.extend({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  region: z.string().min(2).max(120),
  process: z.string().min(2).max(120),
  description: z.string().max(2000),
  tastingNotes: z.array(z.string().min(1).max(80)).max(12),
  altitude: z.string().max(120).nullable(),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .url("Enter a valid image URL.")
    .refine((url) => url.startsWith("https://"), {
      message: "The image URL must use HTTPS.",
    })
    .nullable(),
  status: z.enum(["draft", "published", "archived"]),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

const deleteInput = authInput.extend({
  entity: z.enum([
    "products",
    "events",
    "orders",
    "event_registrations",
    "business_inquiries",
    "contact_requests",
  ]),
  id: z.string().uuid(),
});

const eventInput = authInput.extend({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(160),
  summary: z.string().max(500),
  description: z.string().max(3000),
  eventDate: z.string().min(1),
  location: z.string().min(2).max(240),
  capacity: z.number().int().positive().nullable(),
  coverImageUrl: z.string().max(2000).nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  registrationOpen: z.boolean(),
});

const createAdminUserInput = authInput.extend({
  userId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  role: z.enum(["admin", "editor"]),
});

const resetAdminUserPasswordInput = authInput.extend({
  userId: z.string().uuid(),
});

export const getAdminDashboard = createServerFn({ method: "POST" })
  .validator(authInput)
  .handler(async ({ data }) => {
    const { loadDashboard } = await import("./admin-db.server");
    return loadDashboard(data.token);
  });

export const updateRecordStatus = createServerFn({ method: "POST" })
  .validator(statusInput)
  .handler(async ({ data }) => {
    const { changeRecordStatus } = await import("./admin-db.server");
    return changeRecordStatus(data);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .validator(productInput)
  .handler(async ({ data }) => {
    const { upsertProduct } = await import("./admin-db.server");
    return upsertProduct(data);
  });

export const saveEvent = createServerFn({ method: "POST" })
  .validator(eventInput)
  .handler(async ({ data }) => {
    const { upsertEvent } = await import("./admin-db.server");
    return upsertEvent(data);
  });

export const deleteAdminRecord = createServerFn({ method: "POST" })
  .validator(deleteInput)
  .handler(async ({ data }) => {
    const { deleteRecord } = await import("./admin-db.server");
    return deleteRecord(data);
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .validator(createAdminUserInput)
  .handler(async ({ data }) => {
    const { createManagedUser } = await import("./admin-db.server");
    return createManagedUser(data);
  });

export const resetAdminUserPassword = createServerFn({ method: "POST" })
  .validator(resetAdminUserPasswordInput)
  .handler(async ({ data }) => {
    const { resetManagedUserPassword } = await import("./admin-db.server");
    return resetManagedUserPassword(data);
  });

export const recordAdminUserPasswordReset = createServerFn({ method: "POST" })
  .validator(resetAdminUserPasswordInput)
  .handler(async ({ data }) => {
    const { recordManagedUserPasswordReset } =
      await import("./admin-db.server");
    return recordManagedUserPasswordReset(data);
  });

export const getCloudinaryUploadSignature = createServerFn({ method: "POST" })
  .validator(authInput)
  .handler(async ({ data }) => {
    const { createCloudinaryUploadSignature } =
      await import("./admin-db.server");
    return createCloudinaryUploadSignature(data.token);
  });
