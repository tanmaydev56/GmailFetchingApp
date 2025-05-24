// components/emaillist.tsx
"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Loader from './Loader';

export default function EmailList({
  emails,
  pagination,
}: {
  emails: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAndStoreEmails = async () => {
    if (!session) {
      setMessage('You must be logged in to fetch emails');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/fetch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully processed ${data.processed} emails`);
        // Refresh the page to show new emails
        window.location.reload();
      } else {
        setMessage(data.error || 'Error fetching emails');
      }
    } catch (error) {
      setMessage('Failed to fetch and store emails');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center p-10">
        <h2 className="text-2xl font-bold">Email Archive</h2>
        <button
          onClick={fetchAndStoreEmails}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? (<div className='flex'><Loader />
        <p>Loading...</p></div>) : 'Fetch New Emails'}
        </button>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {emails.map((email) => (
          <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {email.subject || '(No subject)'}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                  <p><span className="font-medium">From:</span> {email.sender}</p>
                  <p><span className="font-medium">To:</span> {email.receiver}</p>
                  {email.cc?.length > 0 && (
                    <p><span className="font-medium">CC:</span> {email.cc.join(', ')}</p>
                  )}
                </div>
                <p className="text-gray-500 mt-2 line-clamp-3">
                  {email.snippet}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {new Date(email.internal_date).toLocaleString()}
              </span>
            </div>
            
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-gray-500 mb-2">Attachments:</p>
                <div className="flex gap-3 flex-wrap">
                  {email.attachments.map((attachment: any) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                    >
                      <span className="truncate max-w-xs">{attachment.name}</span>
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        ({formatBytes(attachment.size || 0)})
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {emails.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No emails found. Click {"Fetch New Emails"} to load your inbox.
        </div>
      )}

      <div className="mt-8 flex justify-between items-center">
        {pagination.page > 1 && (
          <Link
            href={`/dashboard?page=${pagination.page - 1}&limit=${pagination.limit}`}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Previous
          </Link>
        )}
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total emails)
        </span>
        {pagination.page < pagination.totalPages && (
          <Link
            href={`/dashboard?page=${pagination.page + 1}&limit=${pagination.limit}`}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}