/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{
      source: "/",
      destination: "/trade",
      permanent: true
    }]
  }
}

module.exports = nextConfig
