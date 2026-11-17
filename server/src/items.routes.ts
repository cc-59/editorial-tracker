import { Router, type Response } from "express";
import * as z from "zod";
import {
  ContentItemInput,
  StatusChange,
  type ContentItem,
} from "@tracker/shared";
import { currentUser } from "./auth";
import * as repo from "./items.repository";
import { findUser } from "./users";
import { canUserSeeItem } from "./visibility";
import { canSetStatus } from "./permissions";

export const itemsRouter = Router();

// Every single-item route loads through here because the role rule must not be skipped.
// A hidden item answers 404 because a 403 would confirm that it exists.
async function loadVisibleItem(
  id: string | undefined,
  res: Response,
): Promise<ContentItem | undefined> {
  const parsedId = z.uuid().safeParse(id);
  const item = parsedId.success
    ? await repo.findItem(parsedId.data)
    : undefined;
  if (!item || !canUserSeeItem(currentUser(res), item)) {
    res.status(404).json({ error: "Item not found" });
    return undefined;
  }
  return item;
}

function rejectUnknownAuthors(authors: string[], res: Response): boolean {
  const unknown = authors.filter((a) => !findUser(a));
  if (unknown.length > 0) {
    res.status(400).json({ error: `Unknown authors: ${unknown.join(", ")}` });
    return true;
  }
  return false;
}

itemsRouter.get("/", async (req, res) => {
  const includeArchived = req.query.archived === "true";
  const user = currentUser(res);
  // The rule filters in code because it should have one implementation.
  // With many rows it would move into the WHERE clause.
  const items = (await repo.listItems())
    .filter((item) => canUserSeeItem(user, item))
    .filter((item) => includeArchived || item.archivedAt === null);
  res.json(items);
});

itemsRouter.get("/:id", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (item) res.json(item);
});

itemsRouter.post("/", async (req, res) => {
  const input = ContentItemInput.parse(req.body);
  if (rejectUnknownAuthors(input.authors, res)) return;
  res.status(201).json(await repo.createItem(input, currentUser(res).userName));
});

itemsRouter.put("/:id", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (!item) return;
  const input = ContentItemInput.parse(req.body);
  if (rejectUnknownAuthors(input.authors, res)) return;
  res.json(await repo.updateItem(item.id, input));
});

itemsRouter.patch("/:id/status", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (!item) return;
  const { status: newStatus } = StatusChange.parse(req.body);

  const user = currentUser(res);
  if (!canSetStatus(user, newStatus, item.status)) {
    res.status(403).json({ error: "Only an editor may publish." });
    return;
  }
  res.json(await repo.setStatus(item.id, newStatus));
});

itemsRouter.post("/:id/archive", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (item) res.json(await repo.setArchived(item.id, true));
});

itemsRouter.post("/:id/unarchive", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (item) res.json(await repo.setArchived(item.id, false));
});
