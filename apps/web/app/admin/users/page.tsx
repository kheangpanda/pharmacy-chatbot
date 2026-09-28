"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateUserStatus } from "@/services/api";

export default function AdminUsersPage() {
  const client = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: getAdminUsers });
  const mutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateUserStatus(id, active),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h1">Users</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage workspace access and account status.
      </Typography>
      <Card>
        <CardContent sx={{ overflowX: "auto" }}>
          {users.isLoading && <CircularProgress />}
          {users.isError && (
            <Alert severity="error">Users could not be loaded.</Alert>
          )}
          {users.data && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.is_active ? "Active" : "Disabled"}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            id: user.id,
                            active: !user.is_active,
                          })
                        }
                      >
                        {user.is_active ? "Disable" : "Enable"}
                      </Button>
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
