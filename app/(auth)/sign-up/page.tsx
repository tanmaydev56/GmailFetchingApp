// app/(auth)/sign-up/page.tsx
"use client";

import Loader from "@/components/Loader";
import SignUpPage from "@/components/SignUpPage";

import { Suspense } from "react";

export default function page() {
  

  return (
   <Suspense fallback={<Loader/>}>
     {/* Suspense is used to handle loading states for components */}
     {/* This allows us to show a loader while the SignUpPage is being loaded */}
    <SignUpPage/>
   </Suspense>
  );
}
