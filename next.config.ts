/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegúrate de que NO haya 'output: export' si usas APIs o SSR
  eslint: {
    ignoreDuringBuilds: true, // Útil para evitar que fallos menores detengan el build
  },
}

module.exports = nextConfig