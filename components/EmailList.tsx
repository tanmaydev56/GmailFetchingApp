// components/EmailList.tsx
'use client';
import { useEffect, useState } from 'react';
import type { Email } from '@/types/database';

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    const fetchEmails = async () => {
    
      try {
        const response = await fetch('/api/emails');
        const data: Email[] = await response.json();
       
        setEmails(data);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };
    fetchEmails();
  }, []);

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <div key={email.message_id} className="p-4 border rounded">
          <h3 className="font-bold">{email.subject}</h3>
          <p>From: {email.sender}</p>
          <p>To: {email.receiver}</p>
          <time className="text-sm text-gray-500">
            {new Date(email.internal_date || email.created_at).toLocaleString()}
          </time>
        </div>
      ))}
    </div>
  );
}