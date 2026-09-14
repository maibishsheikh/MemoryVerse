/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Avoid blocking production builds if optional ESLint plugins aren't installed in CI/Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
