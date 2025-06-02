/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    typedRoutes: true
  },
  
  images: {
    domains: [
      'localhost',
      'kdxwfgljnoaancxafijy.supabase.co'
    ],
    formats: ['image/avif', 'image/webp']
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/auth',
        destination: '/login',
        permanent: true
      }
    ];
  }
};

export default config;