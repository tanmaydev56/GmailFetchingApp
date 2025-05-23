// lib/db.ts
import { Pool } from 'pg';
type EmailAttachment = {
  emailId: number;
  driveFileId: string;
  fileName: string;
  mimeType: string;
  size: number;
};
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Typed query function
export const query = async <T>(text: string, params?: any[]): Promise<{ rows: T[] }> => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Typed transaction client
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export async function saveAttachment({
  emailId,
  driveFileId,
  fileName,
  mimeType,
  size,
}: EmailAttachment) {
  const queryText = `
    INSERT INTO email_attachments (email_id, drive_file_id, file_name, mime_type, size)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [emailId, driveFileId, fileName, mimeType, size];
  const result = await query(queryText, values);
  return result.rows[0];
}