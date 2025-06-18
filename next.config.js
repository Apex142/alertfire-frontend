/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  staticPageGenerationTimeout: 30, // ou une autre valeur
  images: {
    domains: [
      "lh3.googleusercontent.com",
      // tu peux ajouter d'autres domaines si besoin, ex:
      // 'avatars.githubusercontent.com',
    ],
  },
};

module.exports = nextConfig;
