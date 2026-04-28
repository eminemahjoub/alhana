import type { NextConfig } from "next";
import withPWA from "next-pwa";
// @ts-expect-error next-pwa exports are untyped here
import runtimeCaching from "next-pwa/cache";

const baseConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "imagin.studio" },
    ],
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
      method: "GET",
      options: { cacheName: "api-network-only" },
    },
    ...(runtimeCaching as unknown as any[]),
  ],
})(baseConfig as any) as any;
