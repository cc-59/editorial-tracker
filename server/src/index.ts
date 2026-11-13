import express, { type NextFunction, type Request, type Response } from "express";
import * as z from "zod";
import { currentUser, requireUser } from "./auth";
import { itemsRouter } from "./items.routes";
import { DEMO_PASSWORD, findUser, users } from "./users";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const Login = z.object({ userName: z.string(), password: z.string() });

app.post("/api/login", (req, res) => {
  const { userName, password } = Login.parse(req.body);
  const user = findUser(userName);
  if (!user || password !== DEMO_PASSWORD) {
    res.status(401).json({ error: "Wrong username or password" });
    return;
  }
  res.json({ token: user.userName, user });
});

app.get("/api/me", requireUser, (_req, res) => {
  res.json(currentUser(res));
});

app.get("/api/users", requireUser, (_req, res) => {
  res.json(users);
});

app.use("/api/items", requireUser, itemsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: "Invalid input", issues: err.issues });
    return;
  }
  console.error("[SERVER]", err);
  res.status(500).json({ error: "Internal error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`[SERVER] listening on http://localhost:${port}`);
});
