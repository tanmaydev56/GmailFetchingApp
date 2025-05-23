// app/api/fetch-emails/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { google } from 'googleapis';

export async function POST() {
   try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Log the session

    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!session.accessToken) {
      console.log('No access token found in session');
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    // Verify token
    try {
      const tokenInfo = await oauth2Client.getTokenInfo(session.accessToken);
      console.log('Token info:', tokenInfo);
    } catch (tokenError) {
      console.error('Token validation failed:', tokenError);
      return NextResponse.json(
        { error: 'Invalid token', details: tokenError.message },
        { status: 401 }
      );
    }

    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
    });

    if (!res.data.messages) {
      return NextResponse.json(
        { success: true, message: 'No new emails found' }
      );
    }

    // Process and store emails
    const processingResults = await Promise.allSettled(
      res.data.messages.map(async (message) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          });

          const headers = msg.data.payload?.headers || [];
          const getHeader = (name) =>
            headers.find((h) => h.name === name)?.value || null;

          const emailData = {
            message_id: message.id,
            subject: getHeader('Subject'),
            sender: getHeader('From'),
            receiver: getHeader('To'),
            snippet: msg.data.snippet,
            internal_date: msg.data.internalDate
              ? parseInt(msg.data.internalDate)
              : Date.now(),
          };

          await query(
            `INSERT INTO emails
             (message_id, subject, sender, receiver, internal_date, snippet)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (message_id) DO NOTHING`,
            Object.values(emailData)
          );

          return { success: true, id: message.id };
        } catch (e) {
          return { success: false, id: message.id, error: e.message };
        }
      })
    );

    const successful = processingResults.filter(r => r.status === 'fulfilled' && r.value.success);

    return NextResponse.json({
      success: true,
      processed: successful.length,
      total: res.data.messages.length,
      details: processingResults.map(r =>
        r.status === 'fulfilled' ? r.value : r.reason
      )
    });

  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message
      },
      { status: 500 }
    );
  }
}
