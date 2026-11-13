import { useState, type SubmitEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { User } from "@tracker/shared";
import { login } from "./api";

export function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      onLogin(await login(userName.trim(), password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 12 }}>
      <Stack component="form" onSubmit={submit} spacing={2}>
        <Typography variant="h5" component="h1">
          Editorial Tracker
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          autoFocus
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Log in
        </Button>
        <Typography variant="body2" color="text.secondary">
          Demo users: emma (editor), jonas and sara (contributors). The password is in the README.
        </Typography>
      </Stack>
    </Container>
  );
}
