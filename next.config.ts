/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true, // احذف هذا السطر أو ضعه داخل compiler
  compiler: {
    // ts: {
    //   ignoreBuildErrors: true, // هذا يتجاوز كل أخطاء TS أثناء البناء
    // },
    removeConsole: process.env.NODE_ENV === 'production',
    // swcMinify: true, // أو ضعه هنا إذا أردت
  },
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://161.97.73.254:8017/api/:path*',
      },
    ];
  },
};

export default nextConfig;