// app/(auth)/sign-in/page.tsx
"use client";

import Loader from "@/components/Loader";
import LoginPage from "@/components/Login";

import { Suspense } from "react";

export default function page() {
 
  return (
    <Suspense fallback={<Loader/>}>
      <LoginPage  />
    </Suspense>
  );
}
