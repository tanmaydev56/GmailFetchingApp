import EmailList from '@/components/EmailList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import SidebarNavigation from '@/components/SidebarNavigation';
import EmailStatsCards from '@/components/EmailStatsCards';
import { Suspense } from 'react';
import EmailListSkeleton from '@/components/skeletons/EmailListSkeleton';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 20;
  const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : '';
  const label = typeof searchParams.label === 'string' ? searchParams.label : 'inbox';

  const fetchUrl = new URL(`${process.env.NEXTAUTH_URL}/api/emails`);
  fetchUrl.searchParams.set('page', page.toString());
  fetchUrl.searchParams.set('limit', limit.toString());
  if (searchQuery) fetchUrl.searchParams.set('search', searchQuery);
  if (label) fetchUrl.searchParams.set('label', label);

  const res = await fetch(fetchUrl.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`
    },
    next: { tags: ['emails'] }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch emails');
  }

  const data = await res.json();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <SidebarNavigation activeLabel={label} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader user={session.user} searchQuery={searchQuery} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <EmailStatsCards />

          {/* Email List with Suspense for loading state */}
          <Suspense fallback={<EmailListSkeleton />}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <EmailList 
                emails={data.data} 
                pagination={data.pagination}
                currentLabel={label}
              />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}