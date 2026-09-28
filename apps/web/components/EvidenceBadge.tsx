import { Chip } from "@mui/material";
import type { Confidence } from "@/types";

const config: Record<Confidence, { label: string; color: "success" | "info" | "warning" | "error" }> = {
  high: { label: "Strong evidence", color: "success" },
  medium: { label: "Moderate evidence", color: "info" },
  low: { label: "Limited evidence", color: "warning" },
  insufficient_evidence: { label: "Insufficient source evidence", color: "error" },
};

export default function EvidenceBadge({ confidence }: { confidence: Confidence }) {
  const value = config[confidence];
  return <Chip size="small" variant="outlined" color={value.color} label={`Evidence: ${value.label}`} />;
}

