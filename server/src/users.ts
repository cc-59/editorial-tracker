import type { User } from "@tracker/shared";

// Mock authentication, as the case allows: fixed users and one shared demo password.
export const DEMO_PASSWORD = "frihed123";

export const users: User[] = [
  { userName: "emma", displayName: "Emma Holm", role: "editor" },
  { userName: "jonas", displayName: "Jonas Lund", role: "contributor" },
  { userName: "sara", displayName: "Sara Berg", role: "contributor" },
];

export const findUser = (userName: string): User | undefined =>
  users.find((u) => u.userName === userName);
