/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next blocks cross-origin dev requests from any host that isn't `localhost`, so
  // opening http://<lan-ip>:3000 from a phone rendered the HTML but killed the HMR
  // websocket — which left the page server-rendered and never hydrated (no video, no
  // gallery, film frame stuck at scale 0.9). These are bare hostnames: no scheme, no
  // port. `*` matches exactly one label.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
