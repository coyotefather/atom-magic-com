import withSerwistInit from '@serwist/next';
import { withPayload } from '@payloadcms/next/withPayload';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@payloadcms/plugin-mcp', 'mcp-handler', '@modelcontextprotocol/sdk', "pino", "pino-abstract-transport", "thread-stream"],
  webpack(config, { isServer }) {
    // 2. Prevent Serwist's bundler from resolving worker_threads
    if (!isServer) {
      config.externals.push({
        'pino-abstract-transport': 'commonjs pino-abstract-transport',
        'thread-stream': 'commonjs thread-stream',
        'pino': 'commonjs pino',
      });
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withPayload(withSerwist(nextConfig));
