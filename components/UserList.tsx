// components/UserList.tsx
'use client';
import { useEffect, useState } from 'react';
import type { User } from '@/types/database';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="p-4 border rounded">
          <h3 className="font-bold">{user.name || 'Unnamed User'}</h3>
          <p>Email: {user.email}</p>
          <p className="text-sm text-gray-500">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}