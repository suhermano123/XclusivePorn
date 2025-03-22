module.exports = {
  output: "standalone",

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
    formats: ["image/avif", "image/webp"],
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
        hostname: "*.pixhost.to",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ah-img.luscious.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.luscious.net",
        pathname: "/assets/images/**",
      },
      {
        protocol: "https",
        hostname: "cdna.luscious.net",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "gifs.luscious.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ah-img.luscious.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "xmoviesforyou.com",
        pathname: "/**",
      },
    ],
    domains: [
      "t102.pixhost.to", "t86.pixhost.to", "img86.pixhost.to", "img102.pixhost.to",
      "img5.pixhost.to", "t5.pixhost.to", "t0.pixhost.to", "t100.pixhost.to",
      "img99.pixhost.to", "img100.pixhost.to", "img97.pixhost.to", "img101.pixhost.to",
      "t101.pixhost.to", "t12.pixhost.to", "img12.pixhost.to", "img98.pixhost.to",
      "ah-img.luscious.net", "ah-img.luscious.net"
    ],
  },

  compress: true,
};
