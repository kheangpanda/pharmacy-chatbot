"use client";

import { useMemo, useState } from "react";
import { Box, CircularProgress, Divider, Drawer, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { Search, X } from "lucide-react";
import { useDocument } from "@/hooks/useDocuments";

export default function DocumentDetailsDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const detail = useDocument(id);
  const [search, setSearch] = useState("");
  const chunks = useMemo(() => detail.data?.chunks.filter((chunk) => !search || chunk.content.toLowerCase().includes(search.toLowerCase())) || [], [detail.data, search]);
  return <Drawer anchor="right" open={Boolean(id)} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", md: 600 }, p: 3 } }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h2">Document information</Typography><IconButton onClick={onClose}><X size={20} /></IconButton></Stack>{detail.isLoading && <CircularProgress sx={{ m: 4 }} />}{detail.data && <><Typography variant="h6" fontWeight={700} sx={{ mt: 3 }}>{detail.data.title}</Typography><Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, my: 3 }}>{[["Filename", detail.data.filename], ["Author", detail.data.author || "Not specified"], ["Pages", detail.data.page_count], ["Chunks", detail.data.chunk_count], ["Uploaded", new Date(detail.data.created_at).toLocaleString()], ["Status", detail.data.status]].map(([label, value]) => <Box key={String(label)}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={650}>{value}</Typography></Box>)}</Box><Divider /><TextField value={search} onChange={(event) => setSearch(event.target.value)} fullWidth size="small" placeholder="Search inside this document" sx={{ my: 3 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment> }} /><Stack spacing={2}>{chunks.slice(0, 50).map((chunk) => <Box key={chunk.id} sx={{ p: 2, bgcolor: "#F4F8F8", borderRadius: 1 }}><Typography variant="caption" color="primary" fontWeight={700}>PAGE {chunk.page_number}{chunk.section ? ` · ${chunk.section}` : ""}</Typography><Typography variant="body2" sx={{ mt: .5, whiteSpace: "pre-wrap" }}>{chunk.content}</Typography></Box>)}{!chunks.length && <Typography color="text.secondary">No indexed passages match this search.</Typography>}</Stack></>}</Drawer>;
}

