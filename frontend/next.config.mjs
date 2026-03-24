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
        // ALB hostname — set at runtime via NEXT_PUBLIC_PAYLOAD_URL build arg
        protocol: 'http',
        hostname: '**',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
