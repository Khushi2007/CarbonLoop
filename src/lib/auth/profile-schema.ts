import { UserRole } from "@prisma/client";
import { z } from "zod";

/**
 * The CarbonLoop `users` profile fields collected at signup (see
 * src/app/api/auth/signup/route.ts) and, if that row was never created
 * because signup's second step failed, collected again by
 * src/app/api/auth/complete-profile/route.ts. Both routes share this single
 * schema so the ADMIN exclusion below is enforced in exactly one place.
 *
 * ADMIN is deliberately excluded from the enum (not merely checked
 * afterward) so a crafted request body containing `"role": "ADMIN"` is
 * rejected by Zod before any code path could act on it.
 */
export const profileFieldsSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.enum([UserRole.GENERATOR, UserRole.FACILITY]),
  organization: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
