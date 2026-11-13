import { test } from "node:test";
import assert from "node:assert/strict";
import type { ContentItem, User } from "@tracker/shared";
import { canUserSeeItem } from "./visibility";

const user = (userName: string, role: User["role"]): User => ({
  userName,
  displayName: userName,
  role,
});

const item = (createdBy: string, authors: string[]): ContentItem => ({
  id: "00000000-0000-4000-8000-000000000001",
  title: "Test item",
  status: "Draft",
  type: "Article",
  authors,
  deadline: "2026-11-20",
  createdBy,
  createdAt: "2026-11-13T12:00:00.000Z",
  archivedAt: null,
});

test("an editor sees an item they have nothing to do with", () => {
  assert.equal(canUserSeeItem(user("emma", "editor"), item("jonas", ["jonas"])), true);
});

test("a contributor sees an item they created but are not an author of", () => {
  assert.equal(canUserSeeItem(user("sara", "contributor"), item("sara", ["jonas"])), true);
});

test("a contributor sees an item where they are one of several authors", () => {
  assert.equal(canUserSeeItem(user("jonas", "contributor"), item("sara", ["sara", "jonas"])), true);
});

test("a contributor does not see someone else's item", () => {
  assert.equal(canUserSeeItem(user("sara", "contributor"), item("jonas", ["jonas"])), false);
});
