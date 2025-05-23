// types/database.ts
export interface Email {
  id: number;
  message_id: string;
  subject: string | null;
  sender: string | null;
  receiver: string | null;
  internal_date: number | null;
  snippet: string | null;
  created_at: Date;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: Date;
  updated_at: Date | null;
  // Add other user fields as needed
}