-- Runs once, when the database volume is empty.
CREATE TYPE content_status AS ENUM ('Idea', 'Draft', 'Review', 'Published');
CREATE TYPE content_type AS ENUM ('Article', 'Video', 'Podcast', 'Newsletter');

CREATE TABLE content_item (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL CHECK (length(trim(title)) > 0),
  status      content_status NOT NULL DEFAULT 'Idea',
  type        content_type NOT NULL,
  -- Usernames. Users are hardcoded in the server, so there is no user table to reference.
  authors     text[] NOT NULL CHECK (cardinality(authors) > 0),
  deadline    date NOT NULL,
  created_by  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- NULL means not archived. One column, so "archived" and "when" cannot disagree.
  archived_at timestamptz
);

INSERT INTO content_item (title, status, type, authors, deadline, created_by, archived_at) VALUES
  ('Kommunens skjulte regning',        'Review',    'Article',    '{jonas}',       '2026-11-20', 'jonas', NULL),
  ('Interview: tidligere direktør',    'Draft',     'Video',      '{sara,jonas}',  '2026-11-27', 'sara',  NULL),
  ('Ugens overblik',                   'Idea',      'Newsletter', '{sara}',        '2026-11-16', 'emma',  NULL),
  ('Sagen om de forsvundne millioner', 'Published', 'Article',    '{jonas}',       '2026-11-06', 'jonas', NULL),
  ('Podcast: bag om researchen',       'Draft',     'Podcast',    '{emma}',        '2026-12-04', 'emma',  NULL),
  ('Gammel idé om havnen',             'Idea',      'Article',    '{sara}',        '2026-10-30', 'sara',  '2026-11-10T09:00:00Z');
