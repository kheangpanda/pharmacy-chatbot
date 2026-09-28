"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/services/api";
import { useAuth } from "@/features/auth/AuthProvider";

const userNavigation = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: Users },
];

const adminNavigation = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Chat Requests", href: "/admin/chats", icon: MessageSquare },
  { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AppSidebar({
  collapsed,
  onCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: getSessions });
  const { user } = useAuth();
  const selectedSession = search.get("session");
  const width = collapsed ? 76 : 260;

  const newChat = () => {
    router.push("/chat");
    onNavigate?.();
  };
  return (
    <Box
      component="nav"
      sx={{
        width,
        height: "100%",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        transition: "width .2s",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
        }}
      >
        {!collapsed && (
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
          >
            Workspace
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </IconButton>
      </Box>
      <Box sx={{ px: 1.25 }}>
        <Tooltip title={collapsed ? "New chat" : ""} placement="right">
          <Button
            fullWidth
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={newChat}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              minWidth: 0,
              "& .MuiButton-startIcon": { mr: collapsed ? 0 : 1 },
            }}
          >
            {!collapsed && "New Chat"}
          </Button>
        </Tooltip>
      </Box>
      <Box sx={{ px: 1.25, pt: 2, flex: 1, overflowY: "auto" }}>
        {!collapsed && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ px: 1 }}
          >
            CHATS
          </Typography>
        )}
        {sessions.isLoading && !collapsed && (
          <>
            <Skeleton sx={{ mt: 1 }} />
            <Skeleton />
          </>
        )}
        <List dense disablePadding sx={{ mt: 0.5 }}>
          {sessions.data?.map((session) => (
            <Tooltip
              title={collapsed ? session.title : ""}
              placement="right"
              key={session.id}
            >
              <ListItemButton
                component={Link}
                href={`/chat?session=${session.id}`}
                onClick={onNavigate}
                selected={
                  pathname === "/chat" && selectedSession === session.id
                }
                sx={{
                  borderRadius: 1.5,
                  px: collapsed ? 1.5 : 1,
                  justifyContent: "center",
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34 }}>
                  <MessageSquare size={17} />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={session.title}
                    primaryTypographyProps={{ noWrap: true, fontSize: 13 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
      <Divider />
      <List sx={{ px: 1.25 }}>
        {(user?.role === "ADMIN" ? adminNavigation : userNavigation).map(
          ({ label, href, icon: Icon }) => (
            <Tooltip
              title={collapsed ? label : ""}
              placement="right"
              key={href}
            >
              <ListItemButton
                component={Link}
                href={href}
                onClick={onNavigate}
                selected={pathname === href}
                sx={{
                  borderRadius: 1.5,
                  px: collapsed ? 1.5 : 1,
                  justifyContent: "center",
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36 }}>
                  <Icon size={19} />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ),
        )}
      </List>
    </Box>
  );
}
