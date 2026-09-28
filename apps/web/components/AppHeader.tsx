"use client";

import { Box, Chip, IconButton, Typography } from "@mui/material";
import { Menu, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/services/api";

export default function AppHeader({ onMenu }: { onMenu: () => void }) {
  const health = useQuery({ queryKey: ["health"], queryFn: getHealth, refetchInterval: 60_000, retry: false });
  const connected = health.data?.status === "healthy";
  return (
    <Box component="header" sx={{ height: 64, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", px: { xs: 2, md: 3 }, display: "flex", alignItems: "center", gap: 1.5 }}>
      <IconButton onClick={onMenu} sx={{ display: { md: "none" } }} aria-label="Open navigation"><Menu size={21} /></IconButton>
      <ShieldCheck size={24} color="#0B6B74" />
      <Typography fontWeight={750} sx={{ flex: 1 }}>Pharmacy Intelligence</Typography>
      <Chip size="small" label={connected ? "API connected" : health.isLoading ? "Checking API" : "API unavailable"} color={connected ? "success" : "default"} variant="outlined" sx={{ display: { xs: "none", sm: "flex" } }} />
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight={650}>Pharmacist</Typography>
        <Typography variant="caption" color="text.secondary">Clinical workspace</Typography>
      </Box>
    </Box>
  );
}

