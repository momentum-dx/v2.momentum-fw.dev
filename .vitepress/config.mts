// This file is edited in the prebuild step, do not remove the "LOCALE_*" or "SEARCH_*" comments.

import { defineConfig } from "vitepress";
/* LOCALE_IMPORTS_START */
import { rootConfig, rootSearchLocale } from "./config/en";
/* LOCALE_IMPORTS_END */
import { FIRMWARE_REPO, SITE_DESCRIPTION, SITE_HOST, SITE_NAME, SITE_URL } from "./site";

export default defineConfig({
    async transformPageData(pageData) {
        if (pageData.relativePath.startsWith("releases/") && pageData.params?.version) {
            const version = pageData.params.version;
            pageData.title = version;
            pageData.frontmatter.title = `${version} | ${SITE_NAME} Releases`;
            pageData.frontmatter.description = `Changelog and downloads for ${SITE_NAME} ${version}`;
            pageData.frontmatter.ogImage = "/og.png";
            pageData.frontmatter.ogUrl = `${SITE_URL}/releases/${version}`;
        }

        return pageData;
    },

    transformHead: ({ pageData }) => {
        const head: Array<[string, Record<string, string>]> = [];

        if (pageData.relativePath.startsWith("releases/") && pageData.params?.version) {
            const version = pageData.params.version;
            const description = `Changelog and downloads for ${SITE_NAME} ${version}`;
            const ogImage = "/og.png";
            const title = `${version} | Release`;

            head.push(
                ["meta", { name: "title", content: title }],
                ["meta", { name: "description", content: description }],
                ["meta", { property: "og:title", content: title }],
                ["meta", { property: "og:description", content: description }],
                ["meta", { property: "og:image", content: `${SITE_URL}${ogImage}` }],
                [
                    "meta",
                    { property: "og:url", content: `${SITE_URL}/releases/${version}` },
                ],
                ["meta", { name: "twitter:title", content: title }],
                ["meta", { name: "twitter:description", content: description }],
                ["meta", { name: "twitter:image", content: `${SITE_URL}${ogImage}` }],
            );
        } else {
            const frontmatter = pageData.frontmatter || {};
            const headItems = frontmatter.head || [];
            const hasOgImage = headItems.some(
                (headItem: [string, Record<string, string>]) =>
                    headItem?.[0] === "meta" &&
                    headItem?.[1]?.property === "og:image" &&
                    !headItem?.[1]?.content?.includes("#"),
            );
            const hasTwitterImage = headItems.some(
                (headItem: [string, Record<string, string>]) =>
                    headItem?.[0] === "meta" &&
                    headItem?.[1]?.name === "twitter:image" &&
                    !headItem?.[1]?.content?.includes("#"),
            );

            if (!hasOgImage) {
                head.push([
                    "meta",
                    { property: "og:image", content: `${SITE_URL}/og.png` },
                ]);
            }

            if (!hasTwitterImage) {
                head.push([
                    "meta",
                    { name: "twitter:image", content: `${SITE_URL}/og.png` },
                ]);
            }

            const title = frontmatter.title || "";
            const description = frontmatter.description || SITE_DESCRIPTION;
            const pageTitle = title && title !== SITE_NAME ? `${title} | ${SITE_NAME}` : SITE_NAME;

            head.push(
                [
                    "meta",
                    {
                        property: "og:title",
                        content: pageTitle,
                    },
                ],
                ["meta", { property: "og:description", content: description }],
                ["meta", { property: "og:type", content: "website" }],
                ["meta", { property: "og:site_name", content: SITE_HOST }],
                ["meta", { name: "twitter:card", content: "summary_large_image" }],
                [
                    "meta",
                    {
                        name: "twitter:title",
                        content: pageTitle,
                    },
                ],
                ["meta", { name: "twitter:description", content: description }],
            );
        }

        return head;
    },
    markdown: {
        headers: {
            level: [2, 3, 4, 5],
        },
    },
    srcExclude: ["README.md"],
    ignoreDeadLinks: true,
    locales: {
        /* LOCALE_CONFIGS_START */
        root: rootConfig,
        /* LOCALE_CONFIGS_END */
    } as Parameters<typeof defineConfig>[0]["locales"],
    head: [
        ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
        [
            "meta",
            { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" },
        ],
        [
            "meta",
            { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0f0f12" },
        ],
        ["meta", { name: "theme-color", content: "#ABABF5" }],
        [
            "meta",
            {
                name: "keywords",
                content:
                    "Momentum-dx, Momentum, Momentum Firmware, Flipper, Flipper Zero, Firmware, Fork, Custom, Updater, Asset Packs, Github",
            },
        ],
        ["meta", { name: "license", content: "GPL-3.0" }],
        ["meta", { property: "og:title", content: SITE_NAME }],
        [
            "meta",
            {
                property: "og:description",
                content: SITE_DESCRIPTION,
            },
        ],
        ["meta", { name: "author", content: "Project516" }],
        [
            "meta",
            {
                property: "og:image",
                content: `${SITE_URL}/og.png`,
            },
        ],
        ["meta", { property: "og:url", content: `${SITE_URL}/` }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:site_name", content: SITE_HOST }],
        ["meta", { property: "og:locale", content: "en_US" }],
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        ["meta", { name: "twitter:title", content: SITE_NAME }],
        [
            "meta",
            {
                name: "twitter:description",
                content: SITE_DESCRIPTION,
            },
        ],
        [
            "meta",
            {
                name: "twitter:image",
                content: `${SITE_URL}/og.png`,
            },
        ],
        ["meta", { name: "twitter:alt", content: SITE_NAME }],
        ["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }],
        ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
        ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ],
    sitemap: {
        hostname: SITE_URL,
    },
    vite: {
        define: {
            __VUE_PROD_DEVTOOLS__: false,
            __INTLIFY_PROD_DEVTOOLS__: false,
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
            "process.env.NODE_ENV": JSON.stringify("production"),
            global: "globalThis",
        },
        css: {
            preprocessorOptions: {
                css: {
                    charset: false,
                },
            },
        },
        resolve: {
            preserveSymlinks: true,
            alias: {
                "mark.js/src/lib/mark": "mark.js/src/lib/mark.js",
            },
            extensions: [".mjs", ".js", ".ts", ".json"],
        },
        optimizeDeps: {
            include: ["mark.js", "tailwindcss"],
            exclude: ["mark.js/src/vanilla.js", "oh-vue-icons/icons"],
        },
        ssr: {
            noExternal: ["mark.js", "oh-vue-icons", /^oh-vue-icons\/.*/, "protobufjs"],
        },
        server: {
            cors: true,
            proxy: {
                "/api/asset-packs": {
                    target: "https://up.momentum-fw.dev",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/asset-packs/, "/builds/asset-packs"),
                },
                "/assets": {
                    target: "https://up.momentum-fw.dev",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/assets/, "/builds/asset-packs"),
                },
            },
        },
        build: {
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                onwarn: (warning, warn) => {
                    // Suppress eval warnings from protobufjs
                    if (warning.code === "EVAL" && warning.id?.includes("protobufjs")) {
                        return;
                    }
                    warn(warning);
                },
                output: {
                    manualChunks: (id) => {
                        if (id.includes("protobufjs")) {
                            return "protobuf";
                        }
                        if (id.includes("node_modules")) {
                            return "vendor";
                        }
                    },
                },
            },
            commonjsOptions: {
                transformMixedEsModules: true,
            },
        },
    },
    cleanUrls: true,
    lastUpdated: true,
    themeConfig: {
        outline: "deep",
        socialLinks: [
            { icon: "github", link: `https://github.com/${FIRMWARE_REPO}` },
        ],
        search: {
            provider: "local",
            options: {
                locales: {
                    /* SEARCH_LOCALES_START */
                    root: rootSearchLocale,
                    /* SEARCH_LOCALES_END */
                },
            },
        },
    },
});
