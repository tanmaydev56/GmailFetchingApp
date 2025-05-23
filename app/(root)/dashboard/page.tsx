// app/dashboard/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Email } from '@/types/database';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/emails');
      const data = await res.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGmailFetch = async () => {
    try {
      const res = await fetch('/api/fetch-emails', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchEmails(); // Refresh the email list
      }
    } catch (error) {
      console.error('Error triggering email fetch:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
        <button
          onClick={triggerGmailFetch}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Fetch New Emails'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="px-6 py-4 text-xl font-semibold border-b">Your Emails</h2>
        {emails.length === 0 ? (
          <p className="p-6 text-gray-500">No emails found. Click { "Fetch New Emails"} to load your emails.</p>
        ) : (
          <ul className="divide-y">
            {emails.map((email) => (
              <EmailListItem key={email.message_id} email={email} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmailListItem({ email }: { email: Email }) {
  return (
    <li className="p-6 hover:bg-gray-50">
      <div className="flex justify-between">
        <h3 className="font-medium text-gray-900">{email.subject || 'No subject'}</h3>
        <span className="text-sm text-gray-500">
          {email.internal_date ? new Date(email.internal_date).toLocaleDateString() : 'No date'}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        <span className="font-medium">From:</span> {email.sender || 'Unknown'}
      </p>
      <p className="mt-2 text-gray-600 line-clamp-2">
        {email.snippet || 'No content'}
      </p>
    </li>
  );
}
