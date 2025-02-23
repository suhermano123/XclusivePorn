// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    srcDir: 'src',
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignorar los errores de ESLint durante la construcción
  },
  async rewrites() {
    return [
      {
        source: "/proxy/video/:id_video",
        destination: "https://mxdrop.to/e/:id_video",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pornobae.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/wp-content/uploads/**",
      },

      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**",
      },
  
  
    ],
  },
};
