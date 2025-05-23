// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

interface UserData {
  name?: string;
  email?: string;
  image?: string;
}

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (status === "authenticated") {
          // Extract user data from session
          const user = {
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image
          };
          setUserData(user as UserData);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  const handleLogout = async () => {
    try {
      // Clear client-side state
      setUserData(null);
      
      // Sign out using NextAuth (if using)
      await signOut({ redirect: false });
      
      // Redirect to sign-in page
      router.push('/sign-in');
      router.refresh(); // Ensure page updates
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <nav className="p-4 bg-gray-100 flex justify-between items-center">
        <div className="animate-pulse h-6 w-32 bg-gray-300 rounded"></div>
        <div className="animate-pulse h-6 w-24 bg-gray-300 rounded"></div>
      </nav>
    );
  }

  return (
    <nav className="p-4 bg-white shadow-sm flex justify-between items-center">
      <Link href="/" className="text-lg font-semibold text-blue-600">
        Email Archive
      </Link>
      <Link
        href="/fetch-attachments-test"
        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
      >
        Fetch Attachments
      </Link>
      <div className="flex items-center gap-4">
        {userData ? (
          <>
            <div className="flex items-center gap-2">
              {userData.image && (
                <Image
                  src={userData.image}
                  alt="User profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userData.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                  {userData.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}