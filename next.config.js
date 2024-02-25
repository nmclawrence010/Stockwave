/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
    domains: ["api.twelvedata.com", "logo.twelvedata.com"],
  },
};

module.exports = nextConfig;
