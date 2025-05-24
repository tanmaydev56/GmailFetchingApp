// app/(auth)/sign-up/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl mb-4">Sign Up</h1>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Sign up with Google
        </button>
      </div>
    </div>
  );
}
