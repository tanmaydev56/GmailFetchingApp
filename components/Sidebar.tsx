import Link from 'next/link';
import { FiInbox, FiSend, FiStar, FiFile, FiTrash2 } from 'react-icons/fi';

export default function SidebarNavigation({ activeLabel }: { activeLabel: string }) {
  const navItems = [
    { label: 'inbox', icon: <FiInbox />, count: 12 },
    { label: 'starred', icon: <FiStar /> },
    { label: 'sent', icon: <FiSend /> },
    { label: 'drafts', icon: <FiFile />, count: 3 },
    { label: 'trash', icon: <FiTrash2 /> }
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={`/dashboard?label=${item.label}`}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeLabel === item.label
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="capitalize">{item.label}</span>
                {item.count && (
                  <span className="ml-auto inline-block py-0.5 px-3 text-xs rounded-full bg-blue-100 text-blue-800">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}