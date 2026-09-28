"use client";

import { DragEvent, useRef, useState } from "react";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import { UploadCloud } from "lucide-react";
import { useUploadDocuments } from "@/hooks/useDocuments";
import UploadProgress from "./UploadProgress";

export default function DocumentUpload() {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadDocuments();
  const [dragging, setDragging] = useState(false);
  const choose = (files: FileList | null) => {
    if (!files?.length) return;
    const pdfs = Array.from(files).filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length) upload.mutate(pdfs);
  };
  const drop = (event: DragEvent) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files); };
  return (
    <Box>
      <Paper
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}
        sx={{ p: 4, textAlign: "center", border: "1.5px dashed", borderColor: dragging ? "primary.main" : "#B7CACD", bgcolor: dragging ? "#EFF8F8" : "white" }}
      >
        <UploadCloud size={36} color="#0B6B74" />
        <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>Upload Pharmacy Knowledge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Drop pharmacy books or guidelines here</Typography>
        <input ref={input} hidden type="file" accept="application/pdf,.pdf" multiple onChange={(event) => choose(event.target.files)} />
        <Button variant="outlined" onClick={() => input.current?.click()} disabled={upload.isPending}>Choose PDFs</Button>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>PDF only · multiple files supported</Typography>
      </Paper>
      {upload.isPending && <UploadProgress />}
      {upload.isSuccess && <UploadProgress complete />}
      {upload.isError && <Alert severity="error" sx={{ mt: 2 }}>{upload.error.message || "PDF upload failed."}</Alert>}
      {upload.data?.some((document) => document.status === "failed") && <Alert severity="warning" sx={{ mt: 2 }}>One or more PDFs could not be indexed. Check the document status for details.</Alert>}
    </Box>
  );
}

