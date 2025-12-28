import type { NextConfig } from "next"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseHostname = supabaseUrl
  ? new URL(supabaseUrl).hostname
  : "rkcqstubpidtegvpsevl.supabase.co"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage for hero banners
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
      // Unsplash fallback images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // User avatars from various providers
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
}

export default nextConfig
