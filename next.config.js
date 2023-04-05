/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
	images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/pbxt/**',
      },
    ],
		domains: ["oaidalleapiprodscus.blob.core.windows.net"],
  },
}

module.exports = nextConfig
