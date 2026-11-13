import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { ContentItemInput, ContentStatus, ContentType, type ContentItem, type User } from "@tracker/shared";
import { api } from "./api";

interface Props {
  // An item means edit; no item means create.
  item?: ContentItem;
  currentUser: User;
  users: User[];
  onSaved: (item: ContentItem) => void;
  onClose: () => void;
}

export function ItemForm({ item, currentUser, users, onSaved, onClose }: Props) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [type, setType] = useState<string>(item?.type ?? "Article");
  const [status, setStatus] = useState<string>(item?.status ?? "Idea");
  const [authors, setAuthors] = useState<string[]>(item?.authors ?? [currentUser.userName]);
  const [deadline, setDeadline] = useState(item?.deadline ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // Same schema as the server, so the form and the API cannot disagree on what is valid.
    const parsed = ContentItemInput.safeParse({ title, type, status, authors, deadline });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setServerError(null);
    setBusy(true);
    try {
      onSaved(item ? await api.updateItem(item.id, parsed.data) : await api.createItem(parsed.data));
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit} noValidate>
        <DialogTitle>{item ? "Edit content item" : "New content item"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={"title" in errors}
              helperText={errors.title}
              autoFocus
            />
            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              error={"type" in errors}
              helperText={errors.type}
            >
              {ContentType.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              error={"status" in errors}
              helperText={errors.status}
            >
              {ContentStatus.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Authors"
              value={authors}
              onChange={(e) => {
                const value: unknown = e.target.value;
                setAuthors(Array.isArray(value) ? value.map(String) : []);
              }}
              error={"authors" in errors}
              helperText={errors.authors}
              slotProps={{ select: { multiple: true } }}
            >
              {users.map((u) => (
                <MenuItem key={u.userName} value={u.userName}>
                  {u.displayName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              error={"deadline" in errors}
              helperText={errors.deadline}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={busy}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
