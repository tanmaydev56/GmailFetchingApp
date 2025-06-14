import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
