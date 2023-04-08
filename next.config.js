/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');

const nextConfig = {
	i18n,
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
