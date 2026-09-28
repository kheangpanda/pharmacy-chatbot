import { Chip } from "@mui/material";
import { BookOpen } from "lucide-react";
import type { Citation } from "@/types";

export default function CitationChip({
  citation,
  onClick,
}: {
  citation: Citation;
  onClick: () => void;
}) {
  return (
    <Chip
      clickable
      size="small"
      onClick={onClick}
      icon={<BookOpen size={13} />}
      variant="outlined"
      label={`${citation.document} · p.${citation.page}`}
      sx={{
        bgcolor: "white",
        maxWidth: "100%",
        height: 24,
        "& .MuiChip-label": { px: 0.75, fontSize: "0.72rem" },
        "& .MuiChip-icon": { ml: 0.75, mr: -0.25 },
      }}
    />
  );
}
