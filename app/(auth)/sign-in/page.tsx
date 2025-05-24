// app/(auth)/sign-in/page.tsx
"use client";

import Loader from "@/components/Loader";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <Suspense fallback={<Loader/>}>
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl mb-4">Sign In</h1>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Continue with Google
        </button>
      </div>
    </div>
    </Suspense>
  );
}
