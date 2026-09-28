export type Confidence = "high" | "medium" | "low" | "insufficient_evidence";

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

