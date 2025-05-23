import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get emails with pagination
    const emails = await query(
      `SELECT e.*, 
       json_agg(json_build_object(
         'id', a.id,
         'name', a.file_name,
         'url', 'https://drive.google.com/file/d/' || a.drive_file_id,
         'type', a.mime_type
       )) as attachments
       FROM emails e
       LEFT JOIN email_attachments a ON e.id = a.email_id
       GROUP BY e.id
       ORDER BY e.internal_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count for pagination
    const count = await query(
      'SELECT COUNT(*) FROM emails'
    );

    return NextResponse.json({
      success: true,
      data: emails.rows,
      pagination: {
        page,
        limit,
        total: parseInt(count.rows[0].count),
        totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}