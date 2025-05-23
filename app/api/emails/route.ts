import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { query } from "@/lib/db";

// app/api/emails/route.ts
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const result = await query(
      `SELECT
        message_id,
        subject,
        sender,
        receiver,
        internal_date,
        snippet
       FROM emails
       ORDER BY internal_date DESC
       LIMIT 50`
    );

    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json(result.rows, { headers: headers });
  } catch (error) {
    console.error('Error fetching emails from DB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails from database' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
