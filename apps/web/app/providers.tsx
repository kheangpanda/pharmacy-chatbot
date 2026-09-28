"use client";

import { useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0B6B74", dark: "#07545B", light: "#DDF1F1" },
    secondary: { main: "#2F5D8C" },
    background: { default: "#F5F8F9", paper: "#FFFFFF" },
    text: { primary: "#193239", secondary: "#62777C" },
    divider: "#DDE7E9",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, fontSize: "1.75rem" },
    h2: { fontWeight: 700, fontSize: "1.25rem" },
    button: { textTransform: "none", fontWeight: 650 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { border: "1px solid #DDE7E9", boxShadow: "0 1px 2px rgba(19, 53, 60, .04)" } } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 20_000, retry: 1 } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

