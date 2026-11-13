import type { User } from "@tracker/shared";

// Users and one demo password are hardcoded because the case allows mock authentication.
export const DEMO_PASSWORD = "frihed123";

export const users: User[] = [
  { userName: "emma", displayName: "Emma Holm", role: "editor" },
  { userName: "jonas", displayName: "Jonas Lund", role: "contributor" },
  { userName: "sara", displayName: "Sara Berg", role: "contributor" },
];

export const findUser = (userName: string): User | undefined =>
  users.find((u) => u.userName === userName);
