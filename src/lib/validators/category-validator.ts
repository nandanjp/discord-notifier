import { z } from "zod"

export const CATEGORY_NAME_VALIDATOR = z
  .string()
  .min(1, "Category name is required")
  .regex(
    /^[a-zA-Z0-9-]+$/,
    "Categoru name can only contain letters, numbers or hyphens."
  )
