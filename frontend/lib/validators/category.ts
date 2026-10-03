import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  image: z.string().url("Image must be a valid URL").optional(),
  color: z.string().optional(),
  href: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
