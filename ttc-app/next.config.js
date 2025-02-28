/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src')
    };
    return config;
  },
  images: {
    domains: ['mp-s3-images.s3.us-east-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mp-s3-images.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

module.exports = nextConfig; 