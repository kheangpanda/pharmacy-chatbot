"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/services/api";

export default function AdminSettingsPage() {
  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h1">Admin settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review non-secret application and model configuration.
      </Typography>
      {dashboard.isError && (
        <Alert severity="error">Settings could not be loaded.</Alert>
      )}
      {dashboard.data && (
        <Stack spacing={2.5}>
          <Card>
            <CardContent>
              <Typography variant="h2">Provider</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Active provider: {dashboard.data.system.provider}
              </Typography>
              <Typography color="text.secondary">
                Chat model: {dashboard.data.system.chat_model}
              </Typography>
              <Typography color="text.secondary">
                Embedding model: {dashboard.data.system.embedding_model}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h2">Secret status</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                OpenAI API key:{" "}
                {dashboard.data.system.openai_configured
                  ? "Configured"
                  : "Not configured"}
              </Typography>
              <Typography color="text.secondary">
                Gemini API key:{" "}
                {dashboard.data.system.gemini_configured
                  ? "Configured"
                  : "Not configured"}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
