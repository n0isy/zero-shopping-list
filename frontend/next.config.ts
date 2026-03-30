import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['*'],
  serverExternalPackages: ['@rocicorp/zero'],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, {isServer}) => {
    // Zero uses browser APIs (IndexedDB, WebSocket) — never bundle it for SSR
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@rocicorp/zero/react': false,
      };
    }
    return config;
  },
};

export default nextConfig;
