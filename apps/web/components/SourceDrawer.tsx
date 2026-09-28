"use client";

import { Box, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { X } from "lucide-react";
import type { Citation } from "@/types";

export default function SourceDrawer({ citation, onClose }: { citation: Citation | null; onClose: () => void }) {
  return (
    <Drawer anchor="right" open={Boolean(citation)} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 460 }, p: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="overline" color="primary" fontWeight={750}>Source evidence</Typography>
        <IconButton onClick={onClose} aria-label="Close source"><X size={20} /></IconButton>
      </Stack>
      {citation && <>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>{citation.document}</Typography>
        <Stack direction="row" spacing={4} sx={{ my: 3 }}>
          <Box><Typography variant="caption" color="text.secondary">Page</Typography><Typography fontWeight={650}>{citation.page}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Section</Typography><Typography fontWeight={650}>{citation.section || "Not specified"}</Typography></Box>
        </Stack>
        <Divider />
        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Retrieved passage</Typography>
        <Box sx={{ p: 2, bgcolor: "#F4F8F8", borderLeft: "3px solid", borderColor: "primary.main", borderRadius: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{citation.content || "The retrieved passage is unavailable."}</Typography>
        </Box>
      </>}
    </Drawer>
  );
}

