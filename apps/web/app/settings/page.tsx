"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/services/api";

type Provider = "openai" | "gemini";

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>("openai");
  const [results, setResults] = useState(5);
  const [candidates, setCandidates] = useState(20);
  const health = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30_000,
    retry: false,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("llm-provider");
    if (saved === "gemini" || saved === "openai") setProvider(saved);
  }, []);

  const changeProvider = (value: Provider) => {
    setProvider(value);
    window.localStorage.setItem("llm-provider", value);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h1">Settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review application preferences and service status.
      </Typography>
      <Stack spacing={2.5}>
        <Card>
          <CardContent>
            <Typography variant="h2">General</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Pharmacy Intelligence is configured as an evidence-based
              pharmacist knowledge-support workspace.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              API keys and database credentials are managed securely by the
              backend and are never exposed here.
            </Alert>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h2">Chat provider</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Choose which model provider answers new questions.
            </Typography>
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                label="Provider"
                value={provider}
                onChange={(event) =>
                  changeProvider(event.target.value as Provider)
                }
              >
                <MenuItem value="openai">OpenAI ChatGPT</MenuItem>
                <MenuItem value="gemini">Google Gemini</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h2">RAG Settings</Typography>
            <Typography variant="caption" color="text.secondary">
              UI preview · backend configuration support is planned
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight={650}>
                Retrieval result count: {results}
              </Typography>
              <Slider
                value={results}
                min={1}
                max={10}
                marks
                step={1}
                onChange={(_, value) => setResults(value as number)}
              />
              <Typography variant="body2" fontWeight={650} sx={{ mt: 2 }}>
                Candidate chunks: {candidates}
              </Typography>
              <Slider
                value={candidates}
                min={10}
                max={40}
                marks
                step={5}
                onChange={(_, value) => setCandidates(value as number)}
              />
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Selected knowledge sources</InputLabel>
                <Select label="Selected knowledge sources" value="all">
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h2">API Status</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  FastAPI and PostgreSQL connectivity
                </Typography>
              </Box>
              <Chip
                color={health.data?.status === "healthy" ? "success" : "error"}
                variant="outlined"
                label={
                  health.isLoading
                    ? "Checking"
                    : health.data?.status === "healthy"
                      ? "Connected"
                      : "Unavailable"
                }
              />
            </Stack>
            {health.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                The API is unavailable.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
