import { z } from "zod";

export const publishMenuSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    items: z.array(
      z.object({
        name: z.string(),
        price: z.number(),
        available: z.boolean().default(true)
      })
    )
  })
});

export const scanMealSchema = z.object({
  body: z.object({
    payload: z.string()
  })
});

