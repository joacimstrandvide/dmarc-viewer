import { NextConfig } from "next";

/** @type {NextConfig} */
const nextConfig: NextConfig = {
    output: "export",
    basePath: "/dmarc-viewer",
    images: { unoptimized: true },
};

export default nextConfig;
