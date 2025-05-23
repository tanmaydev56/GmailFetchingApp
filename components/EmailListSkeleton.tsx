export default function EmailListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* Header */}
      
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Email List Items */}
      <div className="divide-y divide-gray-200">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-center">
            <div className="flex items-center mr-4">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}