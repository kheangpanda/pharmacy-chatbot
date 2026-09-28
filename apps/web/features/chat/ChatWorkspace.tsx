"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ChatComposer from "@/components/ChatComposer";
import ChatMessage from "@/components/ChatMessage";
import LoadingMessage from "@/components/LoadingMessage";
import SourceDrawer from "@/components/SourceDrawer";
import SuggestedQuestion from "@/components/SuggestedQuestion";
import { chat, getHealth, getSession } from "@/services/api";
import type { ChatMessage as Message, Citation } from "@/types";

const suggestions = [
  "What are the contraindications of metformin?",
  "What are the adverse effects of amoxicillin?",
  "Does clarithromycin interact with simvastatin?",
  "What counseling should be provided for warfarin?",
  "What does the knowledge base say about insulin storage?",
  "What information is available about metformin and renal impairment?",
];

export default function ChatWorkspace() {
  const search = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = search.get("session") || undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [source, setSource] = useState<Citation | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const bottomRef = useRef<HTMLDivElement>(null);
  const session = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: Boolean(sessionId),
  });
  const health = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
  });

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem("llm-provider");
    if (saved === "gemini" || saved === "openai") setProvider(saved);
  }, []);
  useEffect(() => {
    setMessages(session.data?.messages || []);
  }, [session.data, sessionId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mutation = useMutation({
    mutationFn: ({
      question,
      activeSession,
    }: {
      question: string;
      activeSession?: string;
    }) => chat(question, activeSession, provider),
    onSuccess: (response) => {
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        intent: response.intent,
        citations: response.citations,
        confidence: response.confidence,
        created_at: new Date().toISOString(),
      };
      setMessages((current) => [...current, assistant]);
      if (!sessionId) router.replace(`/chat?session=${response.session_id}`);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (requestError: Error) =>
      setError(
        requestError.message || "The chat request failed. Please try again.",
      ),
  });

  const send = (question: string) => {
    setError("");
    const user: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, user]);
    mutation.mutate({ question, activeSession: sessionId });
  };

  const isNew = messages.length === 0 && !session.isLoading;
  return (
    <Box
      sx={{
        maxWidth: 980,
        mx: "auto",
        px: { xs: 2, md: 4 },
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ pt: { xs: 3, md: 5 }, pb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="h1">Pharmacy Intelligence</Typography>
            <Typography color="text.secondary">
              Evidence-based pharmacy knowledge assistant
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              color={
                mounted && health.data?.status === "healthy"
                  ? "success"
                  : "default"
              }
              variant="outlined"
              label={
                !mounted || health.isLoading
                  ? "Knowledge Base: Checking"
                  : health.data?.status === "healthy"
                    ? "Knowledge Base: Ready"
                    : "Knowledge Base: Unavailable"
              }
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ flex: 1 }}>
        {session.isError && (
          <Alert severity="error">This conversation could not be loaded.</Alert>
        )}
        {isNew && (
          <Box sx={{ py: { xs: 3, md: 7 } }}>
            <Typography variant="h2" sx={{ mb: 1 }}>
              How can I support your pharmacy research?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Answers are grounded in your uploaded references, with page-level
              citations for verification.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.25,
              }}
            >
              {suggestions.map((question) => (
                <SuggestedQuestion
                  key={question}
                  onClick={() => send(question)}
                >
                  {question}
                </SuggestedQuestion>
              ))}
            </Box>
          </Box>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCitation={setSource}
          />
        ))}
        {mutation.isPending && <LoadingMessage />}
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        <div ref={bottomRef} />
      </Box>
      <ChatComposer onSend={send} disabled={mutation.isPending} />
      <SourceDrawer citation={source} onClose={() => setSource(null)} />
    </Box>
  );
}
