// app/api/data/route.ts
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM your_table');
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}