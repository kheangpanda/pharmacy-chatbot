export type Confidence = "high" | "medium" | "low" | "insufficient_evidence";
export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
};

export type AuthResponse = { access_token: string; token_type: string; user: User };

export type Citation = {
  document: string;
  document_id?: string | null;
  page: number;
  section?: string | null;
  content?: string | null;
};

export type ChatResponse = {
  question: string;
  session_id: string;
  intent: string;
  answer: string;
  citations: Citation[];
  retrieved_chunks: number;
  confidence: Confidence;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string | null;
  citations: Citation[];
  confidence?: Confidence | null;
  created_at: string;
};

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
};

export type ChatSessionDetail = ChatSession & { messages: ChatMessage[] };

export type Document = {
  id: string;
  title: string;
  filename: string;
  author?: string | null;
  description?: string | null;
  page_count: number;
  chunk_count: number;
  status: "processing" | "ready" | "failed";
  error_message?: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentChunk = {
  id: string;
  page_number: number;
  chapter?: string | null;
  section?: string | null;
  content: string;
};

export type DocumentDetail = Document & { chunks: DocumentChunk[] };
export type DocumentList = { items: Document[]; total: number; pages_indexed: number; chunks_indexed: number };
export type Health = { status: string; database: string };

export type DashboardStats = {
  users: { total: number; active: number; new_today: number };
  chats: { total_sessions: number; total_messages: number; questions_today: number; questions_last_7_days: number; questions_this_month: number };
  knowledge_base: { documents: number; pages: number; chunks: number; ready_documents: number; failed_documents: number };
  system: { database: string; rag: string; provider: string; chat_model: string; embedding_model: string; openai_configured: boolean; gemini_configured: boolean };
};

export type AdminChatSummary = { session_id: string; user_id: string; username: string; title: string; message_count: number; created_at: string; updated_at: string };

