/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  async redirects() {
    return [
      { source: "/studio", destination: "/about", permanent: true },
      { source: "/films", destination: "/work", permanent: true },
    ];
  },
};
export default nextConfig;
