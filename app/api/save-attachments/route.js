// api/save-attachments/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { emailId, messageId } = await req.json();
    if (!emailId || !messageId) {
      return NextResponse.json({ error: 'Missing emailId or messageId' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL,
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const attachments = message.data.payload?.parts?.filter(
      (part) => part.filename && part.body?.attachmentId
    );

    if (!attachments || attachments.length === 0) {
      return NextResponse.json({ message: 'No attachments found in email.' });
    }

    // Upload each attachment
    for (const part of attachments) {
      try {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId,
          id: part.body.attachmentId,
        });

        const fileData = Buffer.from(attachment.data.data, 'base64');

        const uploaded = await drive.files.create({
          resource: {
            name: part.filename,
            mimeType: part.mimeType,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
          },
          media: {
            mimeType: part.mimeType,
            body: fileData,
          },
          fields: 'id,name,mimeType,size,webViewLink',
        });

        await query(
          `INSERT INTO email_attachments
           (email_id, drive_file_id, file_name, mime_type, size)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email_id, drive_file_id) DO NOTHING`,
          [emailId, uploaded.data.id, uploaded.data.name, uploaded.data.mimeType, uploaded.data.size || 0]
        );
      } catch (err) {
        console.error(`Attachment upload failed for ${part.filename}:`, err);
      }
    }

    return NextResponse.json({ success: true, uploaded: attachments.length });

  } catch (error) {
    console.error('Attachment API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
