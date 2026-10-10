/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  eslint: {
    // `npm run lint` is executed separately; Next 15's build runner does not
    // support this project's flat ESLint configuration.
    ignoreDuringBuilds: true
  },
  experimental: {
    cpus: 1
  },
  async redirects() {
    return [
      {
        source: "/zona/:slug",
        destination: "/zonas/:slug",
        permanent: true
      }
    ];
  },
  images: {
    domains: ["images.unsplash.com"]
  }
};

export default nextConfig;
