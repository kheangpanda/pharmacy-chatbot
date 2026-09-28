"use client";

import { Box, Button, Chip, IconButton, Typography } from "@mui/material";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/services/api";
import { useAuth } from "@/features/auth/AuthProvider";

export default function AppHeader({ onMenu }: { onMenu: () => void }) {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 60_000,
    retry: false,
  });
  const connected = health.data?.status === "healthy";
  const { user, logout } = useAuth();
  return (
    <Box
      component="header"
      sx={{
        height: 64,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        px: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <IconButton
        onClick={onMenu}
        sx={{ display: { md: "none" } }}
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </IconButton>
      <ShieldCheck size={24} color="#0B6B74" />
      <Typography fontWeight={750} sx={{ flex: 1 }}>
        Pharmacy Intelligence
      </Typography>
      <Chip
        size="small"
        label={
          connected
            ? "API connected"
            : health.isLoading
              ? "Checking API"
              : "API unavailable"
        }
        color={connected ? "success" : "default"}
        variant="outlined"
        sx={{ display: { xs: "none", sm: "flex" } }}
      />
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight={650}>
          {user?.full_name || user?.username}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role === "ADMIN" ? "Administrator" : "Clinical workspace"}
        </Typography>
      </Box>
      <Button
        size="small"
        onClick={() => void logout()}
        startIcon={<LogOut size={16} />}
      >
        Logout
      </Button>
    </Box>
  );
}
