import { Avatar, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { Cross } from "lucide-react";

export default function LoadingMessage() {
  return <Stack direction="row" spacing={1.5} alignItems="center" sx={{ my: 3 }}><Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}><Cross size={18} /></Avatar><CircularProgress size={18} /><Box><Typography variant="body2" fontWeight={650}>Searching pharmacy knowledge...</Typography><Typography variant="caption" color="text.secondary">Retrieving relevant passages and checking source evidence</Typography></Box></Stack>;
}

