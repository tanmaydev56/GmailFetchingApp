'use client';

import { useState } from 'react';

interface Attachment {
  fileName: string;
  link: string;
  size: number;
  mimeType: string;
}

export default function FetchAttachmentsTest() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleFetch = async () => {
    setLoading(true);
    setMessage('');
    setAttachments([]);

    try {
      const res = await fetch('/api/fetch-attachments', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Success: Processed ${data.count || 0} attachments`);
        if (data.attachments) {
          setAttachments(data.attachments);
        }
      } else {
        setMessage(`❌ Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Request failed');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
  };

  const getFileIcon = (mimeType: string) => {
    const type = mimeType.split('/')[0];
    switch (type) {
      case 'image':
        return '🖼️';
      case 'application':
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word')) return '📝';
        if (mimeType.includes('excel')) return '📊';
        if (mimeType.includes('powerpoint')) return '📑';
        return '📁';
      case 'text':
        return '📝';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Gmail Attachment Fetcher</h1>
        
        <div className="mb-6">
          <button
            onClick={handleFetch}
            disabled={loading}
            className={`px-6 py-3 rounded-md font-semibold text-white ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Fetch Gmail Attachments'
            )}
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b font-semibold text-gray-700">
              Processed Attachments ({attachments.length})
            </div>
            <div className="divide-y">
              {attachments.map((attachment, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getFileIcon(attachment.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={attachment.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium truncate block"
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                      </a>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatFileSize(attachment.size)} • {attachment.mimeType}
                      </div>
                    </div>
                    <a
                      href={attachment.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}