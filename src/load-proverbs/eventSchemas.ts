import z from "zod";
import { ProverbSchema } from "../models/proverbStoreSchemas";

export const LoadProverbsEventSchema = z.object({
  proverbs: z.array(ProverbSchema),
  version: z.string().lowercase(),
  citation: z.string().optional(),
});

export type LoadProverbsEvent = z.infer<typeof LoadProverbsEventSchema>;
