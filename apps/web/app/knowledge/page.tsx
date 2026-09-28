"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Card, CardContent, CircularProgress, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { BookOpen, Database, FileText, Layers, Search } from "lucide-react";
import DeleteDocumentDialog from "@/components/DeleteDocumentDialog";
import DocumentTable from "@/components/DocumentTable";
import DocumentUpload from "@/components/DocumentUpload";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types";

export default function KnowledgePage() {
  const documents = useDocuments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleting, setDeleting] = useState<Document | null>(null);
  const filtered = useMemo(() => documents.data?.items.filter((doc) => (status === "all" || doc.status === status) && `${doc.title} ${doc.filename}`.toLowerCase().includes(search.toLowerCase())) || [], [documents.data, search, status]);
  const stats = [
    ["Documents", documents.data?.total || 0, FileText], ["Pages indexed", documents.data?.pages_indexed || 0, BookOpen],
    ["Knowledge chunks", documents.data?.chunks_indexed || 0, Layers], ["Vector database", documents.isError ? "Unavailable" : "Ready", Database],
  ] as const;
  return <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: "auto" }}><Typography variant="h1">Knowledge Base</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Manage the evidence sources used for pharmacy answers.</Typography><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>{stats.map(([label, value, Icon]) => <Card key={label}><CardContent><Stack direction="row" justifyContent="space-between"><Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={750}>{typeof value === "number" ? value.toLocaleString() : value}</Typography></Box><Icon color="#0B6B74" size={22} /></Stack></CardContent></Card>)}</Box><DocumentUpload /><Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ my: 3 }}><TextField size="small" placeholder="Search knowledge sources" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ flex: 1 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment> }} /><FormControl size="small" sx={{ minWidth: 170 }}><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}><MenuItem value="all">All statuses</MenuItem><MenuItem value="ready">Ready</MenuItem><MenuItem value="processing">Processing</MenuItem><MenuItem value="failed">Failed</MenuItem></Select></FormControl></Stack>{documents.isLoading ? <CircularProgress /> : documents.isError ? <Alert severity="error">The knowledge base could not be loaded.</Alert> : <DocumentTable documents={filtered} onDelete={setDeleting} />}<DeleteDocumentDialog document={deleting} onClose={() => setDeleting(null)} /></Box>;
}

