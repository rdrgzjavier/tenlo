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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }
        ]
      },
      {
        source: "/llms.txt",
        headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }]
      }
    ];
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
