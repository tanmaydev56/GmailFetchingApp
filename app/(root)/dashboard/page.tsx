import EmailList from '@/components/EmailList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const limit = typeof params.limit === 'string' ? parseInt(params.limit) : 20;

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/emails?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await res.json();

  return (
    <div className="container mx-auto px-4 py-8">
      
      <EmailList emails={data.data} pagination={data.pagination} />
    </div>
  );
}