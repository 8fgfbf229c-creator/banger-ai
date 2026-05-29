/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_IMAGE_API_KEY: process.env.GEMINI_IMAGE_API_KEY,
  }
}
module.exports = nextConfig
