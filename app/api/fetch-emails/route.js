// api/fetch-emails/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { google } from 'googleapis';

// Store the last processed historyId
let lastHistoryId = null;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get current historyId to track new emails
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const currentHistoryId = profile.data.historyId;

    // If we have a lastHistoryId, only fetch changes since then
    const fetchParams = {
      userId: 'me',
      maxResults: 50,
      labelIds: ['INBOX'],
    };

    if (lastHistoryId) {
      fetchParams.historyTypes = ['messageAdded'];
      fetchParams.startHistoryId = lastHistoryId;
    }

    const res = await gmail.users.messages.list(fetchParams);

    if (!res.data.messages || res.data.messages.length === 0) {
      return NextResponse.json({ success: true, message: 'No new emails found' });
    }

    // Process each new message
    const results = await Promise.allSettled(
      res.data.messages.map(async (message) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          const headers = msg.data.payload?.headers || [];
          const getHeader = (name) => headers.find((h) => h.name === name)?.value || null;

          // Process email data
          const emailData = {
            message_id: message.id,
            thread_id: msg.data.threadId,
            subject: getHeader('Subject'),
            sender: getHeader('From'),
            receiver: getHeader('To'),
            cc: getHeader('Cc')?.split(',').map(s => s.trim()) || [],
            bcc: getHeader('Bcc')?.split(',').map(s => s.trim()) || [],
            snippet: msg.data.snippet,
            internal_date: parseInt(msg.data.internalDate) || Date.now(),
            references: getHeader('References')?.split(' ') || [],
            in_reply_to: getHeader('In-Reply-To'),
          };

          // Extract email body
          const { bodyText, bodyHtml } = extractEmailBody(msg.data.payload);
          emailData.body_text = bodyText;
          emailData.body_html = bodyHtml;

          // Insert email
          const emailResult = await query(
            `INSERT INTO emails (
              message_id, thread_id, subject, sender, receiver, cc, bcc, 
              snippet, internal_date, "references", in_reply_to, body_text, body_html
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (message_id) DO NOTHING
            RETURNING id`,
            Object.values(emailData)
          );

          // Process attachments if email was inserted
          if (emailResult.rows.length > 0) {
            await processAttachments(msg.data, emailResult.rows[0].id, gmail, drive);

          }

          return { success: true, id: message.id };
        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error);
          return { success: false, id: message.id, error: error.message };
        }
      })
    );

    // Update lastHistoryId if we processed new messages
    if (res.data.messages.length > 0) {
      lastHistoryId = currentHistoryId;
    }

    return NextResponse.json({
      success: true,
      processed: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      total: res.data.messages.length,
      newHistoryId: currentHistoryId,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// Improved email body extraction
function extractEmailBody(payload) {
  let bodyText = '';
  let bodyHtml = '';

  function processPart(part) {
    if (part.parts) {
      part.parts.forEach(processPart);
    }

    if (part.mimeType === 'text/plain') {
      bodyText += Buffer.from(part.body?.data || '', 'base64').toString('utf8');
    } else if (part.mimeType === 'text/html') {
      bodyHtml += Buffer.from(part.body?.data || '', 'base64').toString('utf8');
    } else if (part.mimeType === 'multipart/alternative') {
      part.parts.forEach(processPart);
    }
  }

  if (payload.parts) {
    payload.parts.forEach(processPart);
  } else if (payload.mimeType === 'text/plain') {
    bodyText = Buffer.from(payload.body?.data || '', 'base64').toString('utf8');
  } else if (payload.mimeType === 'text/html') {
    bodyHtml = Buffer.from(payload.body?.data || '', 'base64').toString('utf8');
  }

  return { bodyText, bodyHtml };
}

// Enhanced attachment processing
async function processAttachments(message, emailId, gmail, drive) {
  if (!message.payload?.parts) return;

  const attachments = message.payload.parts.filter(
    (part) => part.filename && part.body?.attachmentId
  );

  await Promise.all(
    attachments.map(async (part) => {
      try {
        // Correctly get attachment data from Gmail API
        const attachment = await gmail.users.messages.attachments.get({
          userId:'me',
          messageId: message.id,
          id: part.body.attachmentId,
        });

        const fileData = Buffer.from(attachment.data.data, 'base64');

        const fileMetadata = {
          name: part.filename,
          mimeType: part.mimeType || 'application/octet-stream',
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };

        const media = {
          mimeType: part.mimeType || 'application/octet-stream',
          body: fileData,
        };

        // Upload to Google Drive
        const file = await drive.files.create({
          resource: fileMetadata,
          media,
          fields: 'id,name,webViewLink,mimeType,size',
        });

        // Store metadata in your database
        await query(
          `INSERT INTO email_attachments
           (email_id, drive_file_id, file_name, mime_type, size)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email_id, drive_file_id) DO NOTHING`,
          [emailId, file.data.id, part.filename, part.mimeType || 'application/octet-stream', file.data.size || 0]
        );
      } catch (error) {
        console.error(`Failed to process attachment ${part.filename}:`, error);
      }
    })
  );
}
