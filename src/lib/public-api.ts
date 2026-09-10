import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const optionalText = z.string().trim().max(2000).optional().nullable();

const registrationInput = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable(),
  guestCount: z.number().int().min(1).max(10),
  notes: optionalText,
});

const businessInput = z.object({
  organization: z.string().trim().min(2).max(180),
  contactPerson: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable(),
  businessType: optionalText,
  coffeeInterest: optionalText,
  estimatedQuantity: optionalText,
  message: optionalText,
});

const contactInput = z.object({
  fullName: z.string().trim().min(2).max(120),
  organization: optionalText,
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable(),
  requestType: z.string().trim().min(2).max(120),
  message: z.string().trim().min(3).max(3000),
});

const orderInput = z.object({
  productId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable(),
  size: z.string().trim().min(1).max(40),
  grind: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(50),
  notes: optionalText,
});

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(
  async () => {
    const { loadPublicCatalog } = await import("./public-db.server");
    return loadPublicCatalog();
  },
);

export const submitEventRegistration = createServerFn({ method: "POST" })
  .validator(registrationInput)
  .handler(async ({ data }) => {
    const { createEventRegistration } = await import("./public-db.server");
    return createEventRegistration(data);
  });

export const submitBusinessInquiry = createServerFn({ method: "POST" })
  .validator(businessInput)
  .handler(async ({ data }) => {
    const { createBusinessInquiry } = await import("./public-db.server");
    return createBusinessInquiry(data);
  });

export const submitContactRequest = createServerFn({ method: "POST" })
  .validator(contactInput)
  .handler(async ({ data }) => {
    const { createContactRequest } = await import("./public-db.server");
    return createContactRequest(data);
  });

export const submitOrder = createServerFn({ method: "POST" })
  .validator(orderInput)
  .handler(async ({ data }) => {
    const { createOrder } = await import("./public-db.server");
    return createOrder(data);
  });

export type PublicCatalog = Awaited<ReturnType<typeof getPublicCatalog>>;
export type PublicProduct = PublicCatalog["products"][number];
export type PublicEvent = PublicCatalog["events"][number];
