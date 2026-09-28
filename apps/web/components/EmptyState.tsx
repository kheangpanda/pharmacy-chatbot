import { Box, Typography } from "@mui/material";
import { Inbox } from "lucide-react";

export default function EmptyState({ title, description }: { title: string; description: string }) {
  return <Box sx={{ py: 7, px: 2, textAlign: "center", color: "text.secondary" }}><Inbox size={34} /><Typography color="text.primary" fontWeight={700} sx={{ mt: 1 }}>{title}</Typography><Typography variant="body2">{description}</Typography></Box>;
}
