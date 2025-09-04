import { z } from "zod";

export const RefsEntitySchema = z.object({
  pk: z.string(),
  sk: z.string(),
  allRefs: z.array(z.string()),
  usedRefs: z.array(z.string()),
});

export type RefsEntity = z.infer<typeof RefsEntitySchema>;

export const ProverbSchema = z.object({
  ref: z.string(),
  proverb: z.string(),
});

export type Proverb = z.infer<typeof ProverbSchema>;

export const ProverbEntitySchema = z.object({
  pk: z.string(),
  sk: z.string(),
  proverb: ProverbSchema,
});

export type ProverbEntity = z.infer<typeof ProverbEntitySchema>;

export const ProverbForTheDayEntitySchema = z.object({
  pk: z.string(),
  sk: z.string(),
  ref: z.string(),
});

export type ProverbForTheDayEntity = z.infer<
  typeof ProverbForTheDayEntitySchema
>;
