/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['a2xvvsimtfki7tdufnkg3depmcd4l56yhhppu5gpru3z45awp5ia.arweave.net'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'a2xvvsimtfki7tdufnkg3depmcd4l56yhhppu5gpru3z45awp5ia.arweave.net',
          port: '',
          pathname: '/**',
        },
      ],
    },
}

export default nextConfig;
