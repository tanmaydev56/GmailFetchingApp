'use client';

import { useState } from 'react';

export default function FetchAttachmentsTest() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/fetch-attachments', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Success: ' + data.message);
      } else {
        setMessage('❌ Error: ' + data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Test Fetch Attachments</h1>
      <button
        onClick={handleFetch}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
      >
        {loading ? 'Fetching...' : 'Fetch Gmail Attachments'}
      </button>
      {message && (
        <p className="mt-4 text-center text-gray-800">{message}</p>
      )}
    </div>
  );
}
