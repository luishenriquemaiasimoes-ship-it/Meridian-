/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  serverExternalPackages: ['exceljs', '@prisma/client', 'bcryptjs'],
  experimental: { optimizePackageImports: ['recharts'] },
};
export default nextConfig;
