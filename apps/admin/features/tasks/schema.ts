import { z } from 'zod';

// Mock, non-relational schema for the scaffold. Replace with a real
// BE-backed schema once the admin API exists.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
});

export type Task = z.infer<typeof taskSchema>;
