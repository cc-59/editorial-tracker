import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ContentStatus, type ContentItem, type User } from "@tracker/shared";
import { api } from "./api";
import { ItemForm } from "./ItemForm";
import { ItemView } from "./ItemView";

type StatusFilter = ContentStatus | "All";

interface Props {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: Props) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [showArchived, setShowArchived] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">("closed");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setItems(await api.listItems(showArchived));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the items");
    }
  }, [showArchived]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    api.users().then(setUsers).catch(() => setUsers([]));
  }, []);

  const nameOf = (userName: string) => users.find((u) => u.userName === userName)?.displayName ?? userName;
  const today = new Date().toLocaleDateString("sv-SE");
  const openItem = items.find((item) => item.id === openId);
  const rows = statusFilter === "All" ? items : items.filter((item) => item.status === statusFilter);

  const columns: GridColDef<ContentItem>[] = [
    { field: "title", headerName: "Title", flex: 2, minWidth: 200 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "type", headerName: "Type", width: 120 },
    {
      field: "authors",
      headerName: "Authors",
      flex: 1,
      minWidth: 160,
      valueGetter: (_value, row) => row.authors.map(nameOf).join(", "),
    },
    {
      field: "createdBy",
      headerName: "Created by",
      width: 140,
      valueGetter: (_value, row) => nameOf(row.createdBy),
    },
    {
      field: "deadline",
      headerName: "Deadline",
      width: 150,
      renderCell: ({ row }) => {
        const overdue = row.deadline < today && row.status !== "Published" && row.archivedAt === null;
        return overdue ? <Chip size="small" color="error" label={`${row.deadline} overdue`} /> : row.deadline;
      },
    },
    {
      field: "archivedAt",
      headerName: "Archived",
      width: 110,
      valueGetter: (_value, row) => (row.archivedAt ? "Yes" : ""),
    },
  ];

  const afterChange = (changed: ContentItem) => {
    // Reload instead of patching the list: an archived item may have to leave the view.
    void reload();
    setOpenId(changed.id);
    setFormMode("closed");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Editorial Tracker
          </Typography>
          <Typography sx={{ mr: 2 }}>
            {user.displayName} ({user.role})
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}>
          {(["All", ...ContentStatus.options] as StatusFilter[]).map((status) => (
            <Chip
              key={status}
              label={status}
              color={statusFilter === status ? "primary" : "default"}
              onClick={() => setStatusFilter(status)}
            />
          ))}
          <FormControlLabel
            control={<Switch checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
            label="Show archived"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={() => setFormMode("create")}>
            New item
          </Button>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={({ row }) => setOpenId(row.id)}
          localeText={{ noRowsLabel: "No content items" }}
          sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Container>
      {openItem && formMode === "closed" && (
        <ItemView
          item={openItem}
          users={users}
          onChanged={afterChange}
          onEdit={() => setFormMode("edit")}
          onClose={() => setOpenId(null)}
        />
      )}
      {formMode !== "closed" && (
        <ItemForm
          item={formMode === "edit" ? openItem : undefined}
          currentUser={user}
          users={users}
          onSaved={afterChange}
          onClose={() => setFormMode("closed")}
        />
      )}
    </>
  );
}
