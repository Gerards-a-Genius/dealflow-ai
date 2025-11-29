/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dealflow/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
