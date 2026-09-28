"use client";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { Document } from "@/types";
import { useDeleteDocument } from "@/hooks/useDocuments";

export default function DeleteDocumentDialog({ document, onClose }: { document: Document | null; onClose: () => void }) {
  const deletion = useDeleteDocument();
  const confirm = () => document && deletion.mutate(document.id, { onSuccess: onClose });
  return <Dialog open={Boolean(document)} onClose={onClose} maxWidth="xs" fullWidth><DialogTitle>Delete this document?</DialogTitle><DialogContent><Typography variant="body2">{document?.title}</Typography><Alert severity="warning" sx={{ mt: 2 }}>All knowledge chunks associated with this document will also be deleted.</Alert>{deletion.isError && <Alert severity="error" sx={{ mt: 2 }}>{deletion.error.message}</Alert>}</DialogContent><DialogActions><Button onClick={onClose}>Cancel</Button><Button color="error" variant="contained" onClick={confirm} disabled={deletion.isPending}>{deletion.isPending ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog>;
}

