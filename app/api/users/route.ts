// app/api/users/route.ts
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import type { User } from '@/types/database';

export async function GET() {
  try {
    const result = await query<User>('SELECT * FROM users ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error:any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}