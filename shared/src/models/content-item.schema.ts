import * as z from "zod";

export const ContentStatus = z.enum(["Idea", "Draft", "Review", "Published"]);
export type ContentStatus = z.infer<typeof ContentStatus>;

export const ContentType = z.enum([
  "Article",
  "Video",
  "Podcast",
  "Newsletter",
]);
export type ContentType = z.infer<typeof ContentType>;

export const ContentItem = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1),
  status: ContentStatus,
  type: ContentType,
  // At least one author because every item needs an owner.
  authors: z.array(z.string()).min(1),
  // Text because JSON has no date type.
  deadline: z.iso.date(),
  createdBy: z.string(),
  createdAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});
export type ContentItem = z.infer<typeof ContentItem>;

// id, createdBy, createdAt and archivedAt are left out because the server sets them.
export const ContentItemInput = ContentItem.pick({
  title: true,
  type: true,
  authors: true,
  deadline: true,
}).extend({
  status: ContentStatus.default("Idea"),
});
export type ContentItemInput = z.infer<typeof ContentItemInput>;

export const StatusChange = z.object({ status: ContentStatus });
export type StatusChange = z.infer<typeof StatusChange>;
