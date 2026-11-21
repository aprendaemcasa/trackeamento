import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const config: NextConfig = {
  poweredByHeader: false,
};

initOpenNextCloudflareForDev();

export default config;
