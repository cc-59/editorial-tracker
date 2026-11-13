import type { ContentItem, ContentItemInput, ContentStatus } from "@tracker/shared";
import { pool } from "./db";

// deadline is cast to text: the driver turns a DATE into a JS Date at local midnight,
// and the day can shift when that is converted to UTC.
const COLUMNS = `
  id, title, status, type, authors,
  deadline::text AS deadline,
  created_by AS "createdBy",
  created_at AS "createdAt",
  archived_at AS "archivedAt"`;

interface Row extends Omit<ContentItem, "createdAt" | "archivedAt"> {
  createdAt: Date;
  archivedAt: Date | null;
}

const toItem = (row: Row): ContentItem => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  archivedAt: row.archivedAt ? row.archivedAt.toISOString() : null,
});

export async function listItems(): Promise<ContentItem[]> {
  const { rows } = await pool.query<Row>(`SELECT ${COLUMNS} FROM content_item ORDER BY deadline`);
  return rows.map(toItem);
}

export async function findItem(id: string): Promise<ContentItem | undefined> {
  const { rows } = await pool.query<Row>(`SELECT ${COLUMNS} FROM content_item WHERE id = $1`, [id]);
  return rows[0] ? toItem(rows[0]) : undefined;
}

export async function createItem(input: ContentItemInput, createdBy: string): Promise<ContentItem> {
  const { rows } = await pool.query<Row>(
    `INSERT INTO content_item (title, status, type, authors, deadline, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
    [input.title, input.status, input.type, input.authors, input.deadline, createdBy],
  );
  return toItem(rows[0]!);
}

export async function updateItem(id: string, input: ContentItemInput): Promise<ContentItem> {
  const { rows } = await pool.query<Row>(
    `UPDATE content_item SET title = $2, status = $3, type = $4, authors = $5, deadline = $6
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, input.title, input.status, input.type, input.authors, input.deadline],
  );
  return toItem(rows[0]!);
}

export async function setStatus(id: string, status: ContentStatus): Promise<ContentItem> {
  const { rows } = await pool.query<Row>(
    `UPDATE content_item SET status = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, status],
  );
  return toItem(rows[0]!);
}

export async function setArchived(id: string, archived: boolean): Promise<ContentItem> {
  const { rows } = await pool.query<Row>(
    `UPDATE content_item SET archived_at = CASE WHEN $2 THEN now() ELSE NULL END
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, archived],
  );
  return toItem(rows[0]!);
}
