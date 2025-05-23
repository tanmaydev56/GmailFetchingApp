// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';

import GoogleProvider from 'next-auth/providers/google';

export const authOptions  = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        },
      },
    }),
  ],
 callbacks: {
  async jwt({ token, account } ) {
    if (account) {
      token.accessToken = account.access_token;
    }
    return token;
  },
  async session({ session, token }) {
    session.accessToken = token.accessToken;
    return session;
  },
},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
