import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { saveAttachment } from '@/lib/db';
import { Readable } from 'stream';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Initialize OAuth2 client with credentials
    const auth = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    auth.setCredentials({ 
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });

    // Initialize API clients
    const gmail = google.gmail({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Fetch unread emails with attachments
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment is:unread',
      maxResults: 5,
    });

    const messageIds = res.data.messages || [];
    const processedAttachments = [];

    for (const message of messageIds) {
      try {
        // Get full message details
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        // Extract email metadata
        const headers = msg.data.payload?.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
        const sender = headers.find(h => h.name === 'From')?.value || 'Unknown sender';
        const gmailId = msg.data.id;
        const threadId = msg.data.threadId;
        const internalDate = msg.data.internalDate;

        // Upsert email record in database
        const result = await query(`
          INSERT INTO emails (
            gmail_message_id, 
            message_id,
            thread_id,
            subject, 
            sender,
            internal_date,
            processing_status
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (gmail_message_id) 
          DO UPDATE SET
            processed_at = CURRENT_TIMESTAMP,
            processing_status = 'reprocessed'
          RETURNING id
        `, [
          gmailId, 
          gmailId, // Using same value for both columns
          threadId,
          subject, 
          sender,
          internalDate,
          'processing'
        ]);
        
        const emailDbId = result.rows[0].id;

        // Process attachments
        const parts = msg.data.payload?.parts || [];
        if (!parts.length && msg.data.payload?.filename) {
          // Handle single attachment case
          parts.push(msg.data.payload);
        }

        for (const part of parts) {
          if (!part.filename) continue;

          try {
            // Get attachment data
            let attachmentBuffer;
            if (part.body?.attachmentId) {
              const attachment = await gmail.users.messages.attachments.get({
                userId: 'me',
                messageId: message.id,
                id: part.body.attachmentId,
              });
              attachmentBuffer = Buffer.from(attachment.data.data, 'base64');
            } else if (part.body?.data) {
              attachmentBuffer = Buffer.from(part.body.data, 'base64');
            } else {
              console.warn(`No attachment data found for ${part.filename}`);
              continue;
            }

            // Create a readable stream from the buffer
            const attachmentStream = new Readable();
            attachmentStream.push(attachmentBuffer);
            attachmentStream.push(null); // Signals end of stream

            // Upload to Google Drive using stream
            const fileRes = await drive.files.create({
              requestBody: {
                name: part.filename,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
                mimeType: part.mimeType || 'application/octet-stream',
              },
              media: {
                mimeType: part.mimeType || 'application/octet-stream',
                body: attachmentStream,
              },
              fields: 'id, webViewLink, size, mimeType',
            });

            // Save attachment metadata to DB
            await saveAttachment({
              emailId: emailDbId,
              driveFileId: fileRes.data.id,
              fileName: part.filename,
              mimeType: fileRes.data.mimeType || part.mimeType || 'application/octet-stream',
              size: Number(fileRes.data.size || part.body?.size || 0),
              driveLink: fileRes.data.webViewLink,
            });

            processedAttachments.push({
              fileName: part.filename,
              link: fileRes.data.webViewLink,
              size: fileRes.data.size,
              mimeType: fileRes.data.mimeType,
            });

            console.log(`✅ Processed attachment: ${part.filename}`);
          } catch (partError) {
            console.error(`❌ Failed to process attachment ${part.filename}:`, partError.message);
            continue;
          }
        }

        // Mark email as read
        await gmail.users.messages.modify({
          userId: 'me',
          id: message.id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });

        // Update email status to processed
        await query(
          'UPDATE emails SET processing_status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['processed', emailDbId]
        );

      } catch (messageError) {
        console.error(`❌ Failed to process message ${message.id}:`, messageError.message);
        continue;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Attachments processed successfully',
      attachments: processedAttachments,
      count: processedAttachments.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Attachment processing error:', error.message);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to process attachments',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}