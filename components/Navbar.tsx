// components/Navbar.tsx
'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { User } from '@/types/database';

export function Navbar({ user }: { user:User }) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-lg font-semibold">
              Gmail Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}