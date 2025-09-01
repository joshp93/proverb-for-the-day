import z from "zod";
import { ProverbSchema } from "./proverbStoreSchemas";

export const LoadProverbsEventSchema = z.object({
  proverbs: z.array(ProverbSchema),
  version: z.string(),
});

export type LoadProverbsEvent = z.infer<typeof LoadProverbsEventSchema>;
