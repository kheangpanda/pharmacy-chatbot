"use client";

import { useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import DeleteDocumentDialog from "@/components/DeleteDocumentDialog";
import DocumentTable from "@/components/DocumentTable";
import DocumentDetailsDrawer from "@/features/documents/DocumentDetailsDrawer";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types";

export default function DocumentsPage() {
  const documents = useDocuments();
  const [viewing, setViewing] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState<Document | null>(null);
  return <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: "auto" }}><Typography variant="h1">Documents</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Review uploaded references and their indexed passages.</Typography>{documents.isLoading ? <CircularProgress /> : documents.isError ? <Alert severity="error">Documents could not be loaded. Check the API connection.</Alert> : <DocumentTable documents={documents.data?.items || []} onView={setViewing} onDelete={setDeleting} />}<DocumentDetailsDrawer id={viewing?.id} onClose={() => setViewing(null)} /><DeleteDocumentDialog document={deleting} onClose={() => setDeleting(null)} /></Box>;
}
