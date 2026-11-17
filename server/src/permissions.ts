import type { ContentStatus, User } from "@tracker/shared";

export function canSetStatus(
  user: User,
  newStatus: ContentStatus,
  originalStatus: ContentStatus,
): boolean {
  if (!user) {
    return false;
  }

  const notPermitted =
    user.role !== "editor" &&
    ((newStatus === "Published" && originalStatus !== "Published") ||
      (newStatus !== "Published" && originalStatus === "Published"));

  if (notPermitted) {
    return false;
  }

  return true;
}
