import { api } from "@/lib/api";
import type { ChatResponse, ChatSession, ChatSessionDetail, DocumentDetail, DocumentList, Health } from "@/types";

export async function chat(question: string, sessionId?: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", { question, session_id: sessionId || null });
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

