import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://beyincikisleri.co/customer/ftronlie-files/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
