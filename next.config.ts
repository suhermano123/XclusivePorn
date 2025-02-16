// next.config.js
module.exports = {
  // Otras configuraciones...
  experimental: {
    srcDir: 'src',
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignorar los errores de ESLint durante la construcción
  },
};
