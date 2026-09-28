import { Box, List, ListItem, Typography } from "@mui/material";

function renderLine(line: string, index: number) {
  if (line.startsWith("### ")) return <Typography key={index} variant="subtitle1" fontWeight={750} sx={{ mt: 2 }}>{line.slice(4)}</Typography>;
  if (line.startsWith("## ")) return <Typography key={index} variant="h6" fontWeight={750} sx={{ mt: index ? 2 : 0 }}>{line.slice(3)}</Typography>;
  if (line.startsWith("# ")) return <Typography key={index} variant="h6" fontWeight={750}>{line.slice(2)}</Typography>;
  if (/^[-*•]\s/.test(line)) return <ListItem key={index} sx={{ display: "list-item", py: 0.2, ml: 2, pl: 0 }}><Typography variant="body2" lineHeight={1.7}>{line.replace(/^[-*•]\s/, "")}</Typography></ListItem>;
  if (!line.trim()) return <Box key={index} sx={{ height: 8 }} />;
  return <Typography key={index} variant="body2" sx={{ lineHeight: 1.75 }}>{line.replace(/\*\*/g, "")}</Typography>;
}

export default function AssistantAnswer({ content }: { content: string }) {
  const lines = content.split("\n");
  return <Box><List disablePadding sx={{ listStyleType: "disc" }}>{lines.map(renderLine)}</List></Box>;
}

