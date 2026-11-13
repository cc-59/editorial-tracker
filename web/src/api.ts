import type { ContentItem, ContentItemInput, ContentStatus, User } from "@tracker/shared";

const TOKEN_KEY = "tracker.token";

// sessionStorage because the login should end when the tab closes.
export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);
export const clearToken = (): void => sessionStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data !== null && typeof data === "object" && "error" in data ? String(data.error) : res.statusText;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export async function login(userName: string, password: string): Promise<User> {
  const { token, user } = await request<{ token: string; user: User }>("POST", "/login", {
    userName,
    password,
  });
  sessionStorage.setItem(TOKEN_KEY, token);
  return user;
}

export const api = {
  me: () => request<User>("GET", "/me"),
  users: () => request<User[]>("GET", "/users"),
  listItems: (includeArchived: boolean) =>
    request<ContentItem[]>("GET", `/items${includeArchived ? "?archived=true" : ""}`),
  createItem: (input: ContentItemInput) => request<ContentItem>("POST", "/items", input),
  updateItem: (id: string, input: ContentItemInput) => request<ContentItem>("PUT", `/items/${id}`, input),
  setStatus: (id: string, status: ContentStatus) =>
    request<ContentItem>("PATCH", `/items/${id}/status`, { status }),
  archive: (id: string) => request<ContentItem>("POST", `/items/${id}/archive`),
  unarchive: (id: string) => request<ContentItem>("POST", `/items/${id}/unarchive`),
};
