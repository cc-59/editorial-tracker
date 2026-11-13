import { useEffect, useState } from "react";
import type { User } from "@tracker/shared";
import { api, clearToken, getToken } from "./api";
import { Dashboard } from "./Dashboard";
import { LoginPage } from "./LoginPage";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  // Starts as checking because the server must confirm a stored token first.
  const [checking, setChecking] = useState(getToken() !== null);

  useEffect(() => {
    if (!checking) return;
    api
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, [checking]);

  const logout = () => {
    clearToken();
    setUser(null);
  };

  if (checking) return null;
  if (!user) return <LoginPage onLogin={setUser} />;
  return <Dashboard user={user} onLogout={logout} />;
}
