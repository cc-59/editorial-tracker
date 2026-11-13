import type { ContentItem, User } from "@tracker/shared";

export function canUserSeeItem(user: User, item: ContentItem): boolean {
  if (!user) {
    return false;
  }

  if (!item) {
    return false;
  }

  if (
    user.role === "contributor" &&
    (item.createdBy === user.userName || item.authors.includes(user.userName))
  ) {
    return true;
  } else if (user.role === "editor") {
    return true;
  }

  return false;
}
