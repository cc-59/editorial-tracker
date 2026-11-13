import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ContentItem, User } from "@tracker/shared";
import { api } from "./api";

interface Props {
  item: ContentItem;
  users: User[];
  onChanged: (item: ContentItem) => void;
  onEdit: () => void;
  onClose: () => void;
}

export function ItemView({ item, users, onChanged, onEdit, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const archived = item.archivedAt !== null;

  const nameOf = (userName: string) => users.find((u) => u.userName === userName)?.displayName ?? userName;

  const run = async (action: () => Promise<ContentItem>) => {
    setBusy(true);
    setError(null);
    try {
      onChanged(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{item.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1}>
            <Chip label={item.status} color={item.status === "Published" ? "success" : "default"} />
            <Chip label={item.type} variant="outlined" />
            {archived && <Chip label="Archived" color="warning" />}
          </Stack>
          <Typography>Authors: {item.authors.map(nameOf).join(", ")}</Typography>
          <Typography>Created by: {nameOf(item.createdBy)}</Typography>
          <Typography>Deadline: {item.deadline}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onEdit} disabled={busy}>
          Edit
        </Button>
        <Button
          onClick={() => run(() => (archived ? api.unarchive(item.id) : api.archive(item.id)))}
          disabled={busy}
        >
          {archived ? "Unarchive" : "Archive"}
        </Button>
        <Button
          variant="contained"
          onClick={() => run(() => api.setStatus(item.id, "Published"))}
          disabled={busy || item.status === "Published"}
        >
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
