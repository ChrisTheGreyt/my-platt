/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "mp-s3-images.s3.us-east-1.amazonaws.com",
          port: "",
          pathname: "/**",
        },
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    webpack: (config) => {
      config.module.rules.push({
        test: /\.json$/,
        type: 'json',
      });
      return config;
    },
  };
  
  // Add rewrites for API proxy
  nextConfig.rewrites = async () => [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*' // Keep the /api prefix
    }
  ];

  export default nextConfig;
