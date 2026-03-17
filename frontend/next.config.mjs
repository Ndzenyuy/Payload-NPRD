import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: 'api/media/**',
      },
      {
        protocol: 'http',
        hostname: '18.215.146.52',
        port: '3001',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'payload-test-dev.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
