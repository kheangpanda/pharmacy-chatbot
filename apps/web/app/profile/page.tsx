"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { updateMe } from "@/services/api";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const mutation = useMutation({
    mutationFn: () => updateMe({ full_name: fullName, email }),
    onSuccess: () => undefined,
  });
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h1">Profile</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your account details.
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Username" value={user?.username || ""} disabled />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            {mutation.isSuccess && (
              <Alert severity="success">Profile updated.</Alert>
            )}
            {mutation.isError && (
              <Alert severity="error">Profile could not be updated.</Alert>
            )}
            <Button
              variant="contained"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              Save changes
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
