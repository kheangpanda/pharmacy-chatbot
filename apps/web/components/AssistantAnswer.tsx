import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  h1: ({ children }) => (
    <Typography
      component="h1"
      variant="h5"
      fontWeight={800}
      sx={{ mt: 2.5, mb: 1 }}
    >
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography
      component="h2"
      variant="h6"
      fontWeight={800}
      sx={{ mt: 2.5, mb: 1 }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      component="h3"
      variant="subtitle1"
      fontWeight={800}
      sx={{ mt: 2, mb: 0.75 }}
    >
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography
      component="p"
      variant="body2"
      sx={{ lineHeight: 1.8, mb: 1.25 }}
    >
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box
      component="ul"
      sx={{
        pl: 2.75,
        my: 1,
        "& ul": { my: 0.25 },
        "& li": { pl: 0.5, mb: 0.5, lineHeight: 1.7 },
      }}
    >
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box
      component="ol"
      sx={{
        pl: 2.75,
        my: 1,
        "& ol": { my: 0.25 },
        "& li": { pl: 0.5, mb: 0.5, lineHeight: 1.7 },
      }}
    >
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body2">
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: "3px solid",
        borderColor: "primary.main",
        bgcolor: "#F3F8F8",
        mx: 0,
        my: 1.5,
        px: 2,
        py: 1,
        color: "text.secondary",
        "& p:last-child": { mb: 0 },
      }}
    >
      {children}
    </Box>
  ),
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 800 }}>
      {children}
    </Box>
  ),
  a: ({ children, href }) => (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={{
        color: "primary.dark",
        fontWeight: 700,
        textDecoration: "underline",
        textUnderlineOffset: "2px",
      }}
    >
      {children}
    </Box>
  ),
  code: ({ children, className }) => (
    <Box
      component="code"
      className={className}
      sx={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.88em",
        bgcolor: "#EDF3F3",
        borderRadius: 0.75,
        px: 0.6,
        py: 0.2,
      }}
    >
      {children}
    </Box>
  ),
  pre: ({ children }) => (
    <Box
      component="pre"
      sx={{
        overflowX: "auto",
        bgcolor: "#193239",
        color: "#E9F3F2",
        borderRadius: 1.5,
        p: 1.75,
        my: 1.5,
        "& code": {
          bgcolor: "transparent",
          p: 0,
          color: "inherit",
          whiteSpace: "pre",
        },
      }}
    >
      {children}
    </Box>
  ),
  hr: () => (
    <Box
      component="hr"
      sx={{ border: 0, borderTop: "1px solid", borderColor: "divider", my: 2 }}
    />
  ),
  table: ({ children }) => (
    <TableContainer
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        my: 1.5,
      }}
    >
      <Table size="small">{children}</Table>
    </TableContainer>
  ),
  thead: ({ children }) => (
    <TableHead sx={{ bgcolor: "#F3F8F8" }}>{children}</TableHead>
  ),
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => (
    <TableCell sx={{ fontWeight: 800, whiteSpace: "nowrap" }}>
      {children}
    </TableCell>
  ),
  td: ({ children }) => (
    <TableCell sx={{ verticalAlign: "top" }}>{children}</TableCell>
  ),
};

export default function AssistantAnswer({ content }: { content: string }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        "& > :first-child": { mt: 0 },
        "& > :last-child": { mb: 0 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
