"use client";

import { Alert, Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import { Cross, UserRound } from "lucide-react";
import type { ChatMessage as ChatMessageType, Citation } from "@/types";
import AssistantAnswer from "./AssistantAnswer";
import CitationChip from "./CitationChip";
import EvidenceBadge from "./EvidenceBadge";
import IntentBadge from "./IntentBadge";

export default function ChatMessage({
  message,
  onCitation,
}: {
  message: ChatMessageType;
  onCitation: (citation: Citation) => void;
}) {
  const assistant = message.role === "assistant";
  if (!assistant)
    return (
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="flex-end"
        sx={{ my: 3 }}
      >
        <Paper
          sx={{
            p: 2,
            maxWidth: 700,
            bgcolor: "#E7F2F3",
            border: "1px solid #CFE3E5",
            boxShadow: "none",
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
          >
            {message.content}
          </Typography>
        </Paper>
        <Avatar sx={{ width: 34, height: 34, bgcolor: "#315D6A" }}>
          <UserRound size={18} />
        </Avatar>
      </Stack>
    );
  const insufficient =
    message.confidence === "insufficient_evidence" &&
    message.citations.length > 0;
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ my: 3 }}>
      <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}>
        <Cross size={18} />
      </Avatar>
      <Box sx={{ maxWidth: 780, minWidth: 0, flex: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1.5 }}
        >
          {message.intent && <IntentBadge intent={message.intent} />}
          {message.confidence && (
            <EvidenceBadge confidence={message.confidence} />
          )}
        </Stack>
        {insufficient ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AssistantAnswer content={message.content} />
          </Alert>
        ) : (
          <AssistantAnswer content={message.content} />
        )}
        {message.citations.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={750}
              sx={{ display: "block", mb: 0.75 }}
            >
              Sources
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {message.citations.map((citation, index) => (
                <CitationChip
                  key={`${citation.document}-${citation.page}-${index}`}
                  citation={citation}
                  onClick={() => onCitation(citation)}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
