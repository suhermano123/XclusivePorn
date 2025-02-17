// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    srcDir: 'src',
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignorar los errores de ESLint durante la construcción
  }
};
