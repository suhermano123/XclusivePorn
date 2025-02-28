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
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "t86.pixhost.to",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img86.pixhost.to",
        pathname: "/**",
      },
    ],
    domains: ["t102.pixhost.to", "t86.pixhost.to", "img86.pixhost.to", "img102.pixhost.to", "img5.pixhost.to", "t5.pixhost.to", "t0.pixhost.to", "t100.pixhost.to", 
    "img99.pixhost.to", "img100.pixhost.to", "img97.pixhost.to", "img101.pixhost.to"
    ],
  },
};
