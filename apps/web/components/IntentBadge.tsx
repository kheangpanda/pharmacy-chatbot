import { Chip } from "@mui/material";

export default function IntentBadge({ intent }: { intent: string }) {
  const label = intent.toLowerCase().split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  return <Chip size="small" label={label} sx={{ bgcolor: "#EDF3F5", color: "text.secondary" }} />;
}

