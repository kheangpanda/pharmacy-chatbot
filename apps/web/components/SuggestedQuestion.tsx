import { Button } from "@mui/material";
import { ArrowUpRight } from "lucide-react";

export default function SuggestedQuestion({ children, onClick }: { children: string; onClick: () => void }) {
  return <Button onClick={onClick} variant="outlined" color="inherit" endIcon={<ArrowUpRight size={16} />} sx={{ justifyContent: "space-between", textAlign: "left", py: 1.25, px: 1.5, bgcolor: "white", borderColor: "divider", fontWeight: 500 }}>{children}</Button>;
}

