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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(usernameOrEmail, password);
      router.replace(user.role === "ADMIN" ? "/admin" : "/chat");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Invalid username/email or password.",
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
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "min(100%, 440px)" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Pharmacy Intelligence"
            sx={{
              width: 72,
              height: 72,
              objectFit: "contain",
              display: "block",
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography variant="h1" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your pharmacy knowledge workspace.
          </Typography>
          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Username or email"
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                required
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                No account?{" "}
                <Box
                  component={Link}
                  href="/register"
                  sx={{ color: "primary.dark", fontWeight: 700 }}
                >
                  Create one
                </Box>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
