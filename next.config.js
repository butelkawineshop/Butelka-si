import createNextIntlPlugin from 'next-intl/plugin'
import { config } from 'dotenv'

config()

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
    ],
  },
}

console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

export default withNextIntl(nextConfig) 