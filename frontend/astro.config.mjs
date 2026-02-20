// @ts-check
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

import sitemap from "@astrojs/sitemap";

const { SITE_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
    prefetch: true,
    trailingSlash: "never",
    site: SITE_URL || "https://tiny-crochet.pages.dev", // 加了个备用网址防报错
    integrations: [sitemap()],
    image: {
        // 删除了 cdn.sanity.io 的域名限制
        remotePatterns: [{ protocol: "https" }],
    },
    vite: {
        server: {},
        css: {
            devSourcemap: true,
        },
    },
    env: {
        schema: {
            SITE_URL: envField.string({
                context: "client",
                access: "public",
                optional: true, // 设为可选，即使 Cloudflare 没填环境变量也不会报错退出
            }),
            // 彻底删除了 POLAR 和 SANITY 的变量检查
        },
    },
});
