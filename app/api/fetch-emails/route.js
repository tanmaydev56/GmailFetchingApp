// app/api/fetch-emails/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { google } from 'googleapis';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    // Verify token
    try {
      await oauth2Client.getTokenInfo(session.accessToken);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch messages
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
    });

    if (!res.data.messages) {
      return NextResponse.json({ success: true, message: 'No emails found' });
    }

    // Process emails with proper error handling
    const results = await Promise.allSettled(
      res.data.messages.map(async (message) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          });

          const headers = msg.data.payload?.headers || [];
          const getHeader = (name) => 
            headers.find((h) => h.name === name)?.value || null;

          // Validate and parse internalDate
          let internalDate = Date.now();
          if (msg.data.internalDate) {
            const parsedDate = parseInt(msg.data.internalDate);
            if (!isNaN(parsedDate)) {
              internalDate = parsedDate;
            }
          }

          // Prepare email data with correct field mapping
          const emailData = [
            message.id,                               // $1 - message_id
            getHeader('Subject'),                      // $2 - subject
            getHeader('From'),                         // $3 - sender
            getHeader('To'),                           // $4 - receiver
            internalDate,                              // $5 - internal_date (BIGINT)
            msg.data.snippet || '',                    // $6 - snippet
            msg.data.payload?.body?.data || ''         // $7 - body (optional)
          ];

          // Execute query with proper parameter order
          await query(
            `INSERT INTO emails
             (message_id, subject, sender, receiver, internal_date, snippet, body)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (message_id) DO NOTHING`,
            emailData
          );

          return { success: true, id: message.id };
        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error);
          return { 
            success: false, 
            id: message.id, 
            error: error.message 
          };
        }
      })
    );

    // Return processing summary
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;

    return NextResponse.json({
      success: true,
      processed: successful,
      total: res.data.messages.length,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}