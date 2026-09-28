"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAdminChats } from "@/services/api";

export default function AdminChatsPage() {
  const chats = useQuery({ queryKey: ["admin-chats"], queryFn: getAdminChats });
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h1">Chat requests</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Inspect recent conversation activity across the workspace.
      </Typography>
      <Card>
        <CardContent sx={{ overflowX: "auto" }}>
          {chats.isLoading && <CircularProgress />}
          {chats.isError && (
            <Alert severity="error">Chat activity could not be loaded.</Alert>
          )}
          {chats.data && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Messages</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chats.data.map((chat) => (
                  <TableRow key={chat.session_id} hover>
                    <TableCell>{chat.username}</TableCell>
                    <TableCell>{chat.title}</TableCell>
                    <TableCell>{chat.message_count}</TableCell>
                    <TableCell>
                      {new Date(chat.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(chat.updated_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
