import { Chip } from "@mui/material";
import { BookOpen } from "lucide-react";
import type { Citation } from "@/types";

export default function CitationChip({ citation, onClick }: { citation: Citation; onClick: () => void }) {
  return <Chip clickable onClick={onClick} icon={<BookOpen size={15} />} variant="outlined" label={`${citation.document} · p.${citation.page}`} sx={{ bgcolor: "white", maxWidth: "100%" }} />;
}

