"use client";

import { Suspense, useEffect, useState } from "react";
import { Box, Drawer } from "@mui/material";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader onMenu={() => setMobileOpen(true)} />
      <Box sx={{ display: "flex", minHeight: 0, flex: 1 }}>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          {mounted && <Suspense><AppSidebar collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} /></Suspense>}
        </Box>
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: 280 } }}>
          {mounted && <Suspense><AppSidebar collapsed={false} onCollapse={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} /></Suspense>}
        </Drawer>
        <Box component="main" sx={{ minWidth: 0, flex: 1, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
