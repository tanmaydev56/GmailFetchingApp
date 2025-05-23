// types/database.ts
export interface Email {
  id: number;
  message_id: string;
  thread_id: string | null;
  subject: string | null;
  sender: string | null;
  receiver: string | null;
  cc: string[] | null;
  bcc: string[] | null;
  snippet: string | null;
  body_text: string | null;
  body_html: string | null;
  internal_date: number | null;
  references: string[] | null;
  in_reply_to: string | null;
  created_at: Date;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse {
  data: Email[];
  pagination: Pagination;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: Date;
  updated_at: Date | null;
  // Add other user fields as needed
}