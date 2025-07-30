/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dominios permitidos para optimización de imágenes
    domains: [
      'i.postimg.cc', // Para tus imágenes actuales
      'postimg.cc', // Dominio principal por si acaso
      'ibb.co', // Dominio principal por si acaso
      'i.ibb.co' // Dominio directo de imágenes de ibb.co
    ],
    
    // Configuración de formatos y calidad
    formats: ['image/webp'],
    minimumCacheTTL: 60, // 60 segundos mínimo de caché
    
    // Configuración para diferentes dispositivos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Opcional: Desactivar optimización en producción si hay problemas
    // unoptimized: process.env.NODE_ENV === 'production'
  },

  // Opcional: Configuración para trailing slashes
  trailingSlash: true,

  // Opcional: Configuración para basePath si tu app no está en la raíz
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Opcional: Habilitar compresión de imágenes
  compress: true,
}

module.exports = nextConfig