import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      // tu peux ajouter d'autres domaines si besoin, ex:
      // 'avatars.githubusercontent.com',
    ],
  },
};

export default nextConfig;
