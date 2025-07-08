/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    // Mejorar la persistencia de sesión
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs'],
  },
  // Configuración para mantener las sesiones activas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;