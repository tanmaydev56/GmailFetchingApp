import { google } from "googleapis";

export function getGmailClient(tokens: {
  access_token: string;
  refresh_token: string;
}) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  oAuth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  return google.gmail({ version: "v1", auth: oAuth2Client });
}