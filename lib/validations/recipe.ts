import { z } from 'zod';

/**
 * Schema for creating a new recipe
 */
export const CreateRecipeSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  content: z.string()
    .min(1, 'Content is required'),

  labels: z.array(z.string())
    .default([])
    .optional(),
});

/**
 * Schema for updating a recipe
 */
export const UpdateRecipeSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),

  content: z.string()
    .min(1, 'Content is required')
    .optional(),

  labels: z.array(z.string())
    .optional(),
});

/**
 * Schema for filtering recipes
 */
export const RecipeFilterSchema = z.object({
  labels: z.array(z.string()).optional(),
  excludeLabels: z.array(z.string()).optional(),
  search: z.string().optional(),
});

/**
 * Schema for shuffle query parameters
 */
export const ShuffleQuerySchema = z.object({
  limit: z.coerce.number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(20, 'Limit cannot exceed 20')
    .default(3),

  includeTags: z.string()
    .transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [])
    .optional(),

  excludeTags: z.string()
    .transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [])
    .optional(),
});

// Export TypeScript types inferred from schemas
export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>;
export type RecipeFilter = z.infer<typeof RecipeFilterSchema>;
export type ShuffleQuery = z.infer<typeof ShuffleQuerySchema>;
