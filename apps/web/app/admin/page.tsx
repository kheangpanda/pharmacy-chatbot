"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/services/api";

const cards = [
  [
    "Total Users",
    (data: Awaited<ReturnType<typeof getAdminDashboard>>) => data.users.total,
  ],
  [
    "Active Users",
    (data: Awaited<ReturnType<typeof getAdminDashboard>>) => data.users.active,
  ],
  [
    "Chat Sessions",
    (data: Awaited<ReturnType<typeof getAdminDashboard>>) =>
      data.chats.total_sessions,
  ],
  [
    "Questions Today",
    (data: Awaited<ReturnType<typeof getAdminDashboard>>) =>
      data.chats.questions_today,
  ],
  [
    "Questions This Month",
    (data: Awaited<ReturnType<typeof getAdminDashboard>>) =>
      data.chats.questions_this_month,
  ],
  [
    "Knowledge Chunks",
    (data: Awaited<ReturnType<typeof getAdminDashboard>>) =>
      data.knowledge_base.chunks,
  ],
] as const;

export default function AdminDashboardPage() {
  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    retry: false,
  });
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h1">Admin dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Operational view of users, chat activity, and the pharmacy knowledge
        base.
      </Typography>
      {dashboard.isLoading && <CircularProgress />}
      {dashboard.isError && (
        <Alert severity="error">Dashboard data is unavailable.</Alert>
      )}
      {dashboard.data && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {cards.map(([label, value]) => (
              <Grid item key={label} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h2" sx={{ mt: 1, fontSize: "2rem" }}>
                      {value(dashboard.data)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Card>
            <CardContent>
              <Typography variant="h2">System</Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ mt: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Provider
                  </Typography>
                  <Typography fontWeight={700}>
                    {dashboard.data.system.provider}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Chat model
                  </Typography>
                  <Typography fontWeight={700}>
                    {dashboard.data.system.chat_model}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Documents ready
                  </Typography>
                  <Typography fontWeight={700}>
                    {dashboard.data.knowledge_base.ready_documents}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Failed documents
                  </Typography>
                  <Typography fontWeight={700}>
                    {dashboard.data.knowledge_base.failed_documents}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
