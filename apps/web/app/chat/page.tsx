import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import ChatWorkspace from "@/features/chat/ChatWorkspace";

export default function ChatPage() {
  return <Suspense fallback={<Box sx={{ p: 6, textAlign: "center" }}><CircularProgress /></Box>}><ChatWorkspace /></Suspense>;
}
