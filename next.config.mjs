/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the dev server accept requests (page loads, API calls, HMR) from an ngrok
  // tunnel instead of only localhost — needed while testing the Unipile connect flow,
  // which requires a public HTTPS URL. The wildcard covers ngrok's random subdomains
  // across restarts; the specific host is kept too in case the wildcard match ever
  // doesn't apply to a given request type.
  allowedDevOrigins: ["*.ngrok-free.app", "36f5-42-0-4-192.ngrok-free.app"],
};

export default nextConfig;
