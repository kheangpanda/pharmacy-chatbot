import { api } from "@/lib/api";
import type { AdminChatSummary, AuthResponse, ChatResponse, ChatSession, ChatSessionDetail, DashboardStats, DocumentDetail, DocumentList, Health, User } from "@/types";

export async function register(payload: { email: string; username: string; password: string; full_name?: string }): Promise<AuthResponse> {
  return (await api.post<AuthResponse>("/auth/register", payload)).data;
}

export async function login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  return (await api.post<AuthResponse>("/auth/login", { username_or_email: usernameOrEmail, password })).data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  return (await api.get<User>("/auth/me")).data;
}

export async function updateMe(payload: { full_name?: string; email?: string }): Promise<User> {
  return (await api.patch<User>("/auth/me", payload)).data;
}

export async function chat(question: string, sessionId?: string, provider?: "openai" | "gemini"): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", { question, session_id: sessionId || null, provider: provider || null });
  return data;
}

export async function getSessions(): Promise<ChatSession[]> {
  return (await api.get<ChatSession[]>("/chat/sessions")).data;
}

export async function getSession(id: string): Promise<ChatSessionDetail> {
  return (await api.get<ChatSessionDetail>(`/chat/sessions/${id}`)).data;
}

export async function createSession(): Promise<ChatSession> {
  return (await api.post<ChatSession>("/chat/sessions", { title: "New pharmacy chat" })).data;
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/chat/sessions/${id}`);
}

export async function getDocuments(): Promise<DocumentList> {
  return (await api.get<DocumentList>("/documents")).data;
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  return (await api.get<DocumentDetail>(`/documents/${id}`)).data;
}

export async function uploadDocuments(files: File[]): Promise<DocumentList["items"]> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const { data } = await api.post<{ documents: DocumentList["items"] }>("/documents/upload", body);
  return data.documents;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function getHealth(): Promise<Health> {
  return (await api.get<Health>("/health", { timeout: 5_000 })).data;
}

export async function getAdminDashboard(): Promise<DashboardStats> {
  return (await api.get<DashboardStats>("/admin/dashboard")).data;
}

export async function getAdminUsers(): Promise<User[]> {
  return (await api.get<User[]>("/admin/users")).data;
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<User> {
  return (await api.patch<User>(`/admin/users/${id}/status`, { is_active: isActive })).data;
}

export async function getAdminChats(): Promise<AdminChatSummary[]> {
  return (await api.get<AdminChatSummary[]>("/admin/chats")).data;
}

