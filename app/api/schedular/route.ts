// api/scheduler/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch emails every 5 minutes (300000 ms)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/fetch-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
        const data = await response.json();
        console.log('Fetched emails:', data);
      } catch (error) {
        console.error('Error in scheduled email fetch:', error);
      }
    }, 300000);
    

    // Cleanup on serverless function termination
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: 'Failed to start scheduler' },
      { status: 500 }
    );
  }
}
