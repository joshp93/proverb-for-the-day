import { z } from "zod";

export const env = z
  .object({
    COGNITO_CLIENT_ID: z.string().min(1),
    COGNITO_USER_POOL_ID: z.string().min(1),
  })
  .parse(process.env);