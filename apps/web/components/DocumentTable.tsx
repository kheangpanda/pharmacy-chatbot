"use client";

import { Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { Eye, Trash2 } from "lucide-react";
import type { Document } from "@/types";
import EmptyState from "./EmptyState";

const statusColor = { ready: "success", processing: "warning", failed: "error" } as const;

export default function DocumentTable({ documents, onView, onDelete }: { documents: Document[]; onView?: (document: Document) => void; onDelete: (document: Document) => void }) {
  if (!documents.length) return <EmptyState title="No knowledge sources" description="Upload a pharmacy book or guideline to build your evidence base." />;
  return <TableContainer component={Paper}><Table size="small"><TableHead><TableRow><TableCell>Document</TableCell><TableCell>Type</TableCell><TableCell align="right">Pages</TableCell><TableCell align="right">Chunks</TableCell><TableCell>Status</TableCell><TableCell>Uploaded</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{documents.map((document) => <TableRow hover key={document.id}><TableCell><Typography variant="body2" fontWeight={650}>{document.title}</Typography><Typography variant="caption" color="text.secondary">{document.filename}</Typography></TableCell><TableCell>PDF</TableCell><TableCell align="right">{document.page_count.toLocaleString()}</TableCell><TableCell align="right">{document.chunk_count.toLocaleString()}</TableCell><TableCell><Tooltip title={document.error_message || ""}><Chip size="small" color={statusColor[document.status]} variant="outlined" label={document.status[0].toUpperCase() + document.status.slice(1)} /></Tooltip></TableCell><TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell><TableCell align="right">{onView && <Tooltip title="View"><IconButton size="small" onClick={() => onView(document)}><Eye size={17} /></IconButton></Tooltip>}<Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(document)}><Trash2 size={17} /></IconButton></Tooltip></TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}

