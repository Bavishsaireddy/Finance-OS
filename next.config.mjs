/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "plaid"],
  devIndicators: false,
};

export default nextConfig;
