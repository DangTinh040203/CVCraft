import { z } from 'zod';

// Mirrors the `User.role` field from planning/2-implementation-phases.md
// (Phase 1) plus a status for admin moderation. Replace with the real
// Prisma-backed type once the admin API exists.
const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('suspended'),
]);
export type UserStatus = z.infer<typeof userStatusSchema>;

const userRoleSchema = z.union([z.literal('user'), z.literal('admin')]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  resumeCount: z.number(),
  createdAt: z.string(),
});
export type User = z.infer<typeof userSchema>;
