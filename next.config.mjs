/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    // skips ESLint errors during `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
