import { Router, type Response } from "express";
import * as z from "zod";
import { ContentItemInput, StatusChange, type ContentItem } from "@tracker/shared";
import { currentUser } from "./auth";
import * as repo from "./items.repository";
import { findUser } from "./users";
import { canUserSeeItem } from "./visibility";

export const itemsRouter = Router();

// Every route that touches one item goes through here, so the role rule cannot be skipped.
// An item the user may not see answers 404, like a missing one: a 403 would confirm it exists.
async function loadVisibleItem(id: string | undefined, res: Response): Promise<ContentItem | undefined> {
  const parsedId = z.uuid().safeParse(id);
  const item = parsedId.success ? await repo.findItem(parsedId.data) : undefined;
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
  // The rule runs in code, not in SQL, so it has exactly one implementation.
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
  const { status } = StatusChange.parse(req.body);
  res.json(await repo.setStatus(item.id, status));
});

itemsRouter.post("/:id/archive", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (item) res.json(await repo.setArchived(item.id, true));
});

itemsRouter.post("/:id/unarchive", async (req, res) => {
  const item = await loadVisibleItem(req.params.id, res);
  if (item) res.json(await repo.setArchived(item.id, false));
});
