# Editorial Tracker

A small internal web app that replaces a spreadsheet: it tracks content items in progress and who
is responsible for them. Built as a test case.

Stack: TypeScript everywhere. React 19 with MUI on the front end, Express 5 on the back end,
PostgreSQL 17, and one shared package with the data model.

## Run it

### With Docker (one command)

```bash
docker compose up --build
```

Open http://localhost:5173. The database starts with six example items.

To start again from the example data:

```bash
docker compose down -v
```

### Without Docker for the app

Needs Node 24 and Docker for the database.

```bash
npm install
docker compose up -d --wait db
npm run dev
```

### Log in

| Username | Role | Password |
|---|---|---|
| `emma` | Editor | `frihed123` |
| `jonas` | Contributor | `frihed123` |
| `sara` | Contributor | `frihed123` |

### Tests and type check

```bash
npm test
npm run typecheck
```

## What it does

- **Login** with hardcoded users and two roles.
- **Dashboard:** the content items in a table with sorting, a filter per status, who created each
  item, its authors and its deadline. A passed deadline on an unpublished item is marked as overdue.
- **Create and edit** an item in a form.
- **Content view:** publish, edit, archive and unarchive an item.
- **Roles:** an Editor sees and manages every item. A Contributor sees and manages only their own.

## Structure

```
shared/   the data model (Zod schemas and the TypeScript types read from them)
server/   Express API: login, auth check, the role rule, routes, SQL
web/      React app: login, dashboard, form, content view
db/       the table and the example data
```

The role rule is one function, `canUserSeeItem` in `server/src/visibility.ts`, with its tests next
to it. Every route that touches an item goes through it.

## Assumptions and decisions

The case text left three things open. I asked about one and decided two.

**1. What "their own" means for a Contributor.** I asked Andreas by mail on 13 November. Until I
have an answer, an item is a Contributor's own if they created it or are listed as one of its
authors. The model holds both facts, so a different answer changes one function and one test.

**2. Who created an item.** The dashboard must show it, but the model in the case has only
`authors`. I added `createdBy` which holds the value of one person, set by the server when the item is created. An item
goes through several rounds of editing, so there is one creator and there can be several authors.

**3. Archive.** The case lists archive as an action but not as a status. My first idea was a fifth
status. I dropped it because the item's previous status would not be saved, and an archived draft would look the
same as an archived published article. I then considered a boolean plus a date and dropped the
boolean, because two fields for one fact can disagree. The result is one nullable date,
`archivedAt`. Null means not archived. Archived items are hidden unless you switch on
"Show archived".

**Other decisions**

- **REST, not GraphQL.** The data is simple and there is one client. With a website, an app and a
  CMS on the same API, I would prefer GraphQL.
- **One shared schema for the types.** The server and the form check input with the same Zod
  schema, so the two sides cannot disagree on what is valid, and I need no code generator.
- **Decisions made on server and the client only shows.** The role rule runs on the server. An item a user
  may not see answers 404, the same as an item that does not exist.
- **The client cannot set `createdBy` or `archivedAt`.** The input schema leaves them out.
- **No form library.** The form has five fields. I read a guide to TanStack Form with Zod and
  ShadCN and chose not to follow it because it solves large forms, and ShadCN would be a second UI system
  next to MUI.
- **The list is filtered in code, not in SQL**, so the rule exists in one place. With many rows I
  would move it into the query.
- **Deadlines are calendar dates sent as text** (`2026-11-20`), so a time zone cannot move the day.

## Known limits

- **Mocked login.** The token is the username, so anyone who knows a username can act as
  that user. Only `server/src/auth.ts` and the login route would change for real, signed tokens.
- Users are hardcoded, so there is no screen to add a user or change a role.
- Only the role rule has automated tests. I checked the routes with requests as each of the three
  users, and the screens by hand.
- The Docker setup runs the development servers. It is for running the case, not for production.
- No history of who changed an item, and no paging in the list.

## What I would do next

1. Real authentication with signed tokens that expire, preferably 2FA.
2. Users in the database, and an admin role that can promote a Contributor to Editor or demote an Editor to Contributor. 
3. Tests for the routes against a test database.
4. A deployment where a new version takes traffic only when it is healthy, and the stable version
   keeps running if it is not.
5. A history per item, so it shows who changed the status, and when.
6. TanStack Query for server state in the web app for caching, loading states and refetch after a
   change. Today the dashboard reloads the list by hand.
7. Check API responses in the browser with the shared schemas. Today the client trusts the shape
   the server sends.

## How I worked

I designed it, built it with Claude Code, wrote the access rule by hand, and I can change any part
of it on request. I use Claude Code every day and work with it as I would with a colleague's pull
request: I set the design, and I read every file before I ship it.

- **Written by hand:** the access rule in `server/src/visibility.ts`. It is the one place where a
  mistake would show one person's work to another, so I wanted to own every line of it.
- **Changed in my review:** a React type that is deprecated in React 19, state and function names
  that did not say what they did, and the commit history, which I split into one topic per commit.
- **Design changes along the way:** archive went from a status to a date, and the API from GraphQL
  to REST. The reasons are under "Assumptions and decisions".
- **How it was checked:** tests for the access rule, including breaking the rule on purpose to see
  the tests fail; requests against the API as each of the three users; every screen clicked through
  as an Editor and as a Contributor; a start from a clean Docker build.
