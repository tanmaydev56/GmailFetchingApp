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

    // Fetch messages with pagination
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: 'in:inbox',
    });

    if (!res.data.messages) {
      return NextResponse.json({ success: true, message: 'No emails found' });
    }

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
              snippet, internal_date, references, in_reply_to, body_text, body_html
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (message_id) DO NOTHING
            RETURNING id`,
            Object.values(emailData)
          );

          // Process attachments if email was inserted
          if (emailResult.rows.length > 0) {
            await processAttachments(
              msg.data.payload,
              emailResult.rows[0].id,
              drive
            );
          }

          return { success: true, id: message.id };
        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error);
          return { success: false, id: message.id, error: error.message };
        }
      })
    );

    return NextResponse.json({
      success: true,
      processed: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      total: res.data.messages.length,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions
function extractEmailBody(payload) {
  let bodyText = '';
  let bodyHtml = '';
  
  if (payload.parts) {
    payload.parts.forEach(part => {
      if (part.mimeType === 'text/plain') {
        bodyText += Buffer.from(part.body.data, 'base64').toString('utf8');
      } else if (part.mimeType === 'text/html') {
        bodyHtml += Buffer.from(part.body.data, 'base64').toString('utf8');
      }
    });
  } else if (payload.mimeType === 'text/plain') {
    bodyText = Buffer.from(payload.body.data, 'base64').toString('utf8');
  } else if (payload.mimeType === 'text/html') {
    bodyHtml = Buffer.from(payload.body.data, 'base64').toString('utf8');
  }

  return { bodyText, bodyHtml };
}

async function processAttachments(payload, emailId, drive) {
  if (!payload.parts) return;

  const attachments = payload.parts.filter(
    part => part.filename && part.filename.length > 0
  );

  await Promise.all(
    attachments.map(async (part) => {
      try {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: payload.messageId || payload.id,
          id: part.body.attachmentId,
        });

        const fileData = Buffer.from(attachment.data.data, 'base64');
        const fileMetadata = {
          name: part.filename,
          mimeType: part.mimeType,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };

        const media = {
          mimeType: part.mimeType,
          body: fileData,
        };

        const file = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id,name,webViewLink,mimeType,size',
        });

        await query(
          `INSERT INTO email_attachments
           (email_id, drive_file_id, file_name, mime_type, size)
           VALUES ($1, $2, $3, $4, $5)`,
          [emailId, file.data.id, part.filename, part.mimeType, file.data.size]
        );
      } catch (error) {
        console.error(`Failed to process attachment ${part.filename}:`, error);
      }
    })
  );
}