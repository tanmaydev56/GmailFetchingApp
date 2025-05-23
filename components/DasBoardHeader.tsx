import SearchBar from './SearchBar';
import UserDropdown from './UserDropdown';

export default function DashboardHeader({ user, searchQuery }: { user: any, searchQuery: string }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <SearchBar initialQuery={searchQuery} />
        </div>
        <UserDropdown user={user} />
      </div>
    </header>
  );
}