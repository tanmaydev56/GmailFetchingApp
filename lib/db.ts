// lib/db.ts
import { Pool } from 'pg';

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