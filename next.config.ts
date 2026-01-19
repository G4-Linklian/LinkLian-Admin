// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactStrictMode: true,
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: '',
  typescript: {
    ignoreBuildErrors: true, // ข้ามการเช็ก Type
  },
  eslint: {
    ignoreDuringBuilds: true, // ข้ามการเช็ก Lint
  },
}

module.exports = nextConfig