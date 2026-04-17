/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/*"],
  },
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;

