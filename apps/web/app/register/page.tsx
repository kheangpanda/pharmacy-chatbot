"use client";

import { FormEvent, useState } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        full_name: form.full_name || undefined,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      router.replace("/chat");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Registration failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "min(100%, 480px)" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h1" sx={{ mb: 1 }}>
            Create account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create a pharmacist workspace account.
          </Typography>
          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Full name"
                value={form.full_name}
                onChange={(event) => update("full_name", event.target.value)}
                autoComplete="name"
              />
              <TextField
                label="Username"
                value={form.username}
                onChange={(event) => update("username", event.target.value)}
                required
                autoComplete="username"
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                required
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                required
                autoComplete="new-password"
              />
              <TextField
                label="Confirm password"
                type="password"
                value={form.confirmation}
                onChange={(event) => update("confirmation", event.target.value)}
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
              >
                {submitting ? "Creating account..." : "Create account"}
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Already registered?{" "}
                <Box
                  component={Link}
                  href="/login"
                  sx={{ color: "primary.dark", fontWeight: 700 }}
                >
                  Sign in
                </Box>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
