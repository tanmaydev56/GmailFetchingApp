import Link from 'next/link';

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
  return (
    <div>
      <div className="grid gap-4">
        {emails.map((email) => (
          <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{email.subject || '(No subject)'}</h3>
                <p className="text-sm text-gray-600">
                  From: {email.sender} | To: {email.receiver}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {email.snippet}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(email.internal_date).toLocaleString()}
              </span>
            </div>
            
            {email.attachments && email.attachments[0].id && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-500">Attachments:</p>
                <div className="flex gap-2 mt-1">
                  {email.attachments.map((attachment: any) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
          Page {pagination.page} of {pagination.totalPages}
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