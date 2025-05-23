import Link from 'next/link';
import { Pagination } from '@/types/database';

interface PaginationControlsProps {
  pagination: Pagination;
}

export default function PaginationControls({
  pagination,
}: PaginationControlsProps) {
  const { page, totalPages } = pagination;

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      {page > 1 && (
        <Link
          href={`/dashboard?page=${page - 1}`}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Previous
        </Link>
      )}

      <span className="px-4 py-2">
        Page {page} of {totalPages}
      </span>

      {page < totalPages && (
        <Link
          href={`/dashboard?page=${page + 1}`}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Next
        </Link>
      )}
    </div>
  );
}