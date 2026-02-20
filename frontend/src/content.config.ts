import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

// 1. 我们删除了这里原本引入 Polar 和 Sanity 的代码

// 2. 我们删除了 products 和 creators 的 defineCollection

// 3. 保留模板原本的演示集合，防止其他未修改的页面报错
const artists = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/data/artists" }),
    schema: z.object({
        name: z.string(),
        stage_name: z.string(),
        genre: z.string(),
        image: z.object({
            src: z.string(),
            alt: z.string(),
        }),
    }),
});

const albums = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/data/albums" }),
    schema: z.object({
        name: z.string(),
        image: z.object({
            src: z.string(),
            alt: z.string(),
        }),
        publishDate: z.date(), // e.g. 2024-09-17
        tracks: z.array(z.string()),
        artist: reference("artists"),
    }),
});

// 4. 只导出保留的集合
export const collections = { artists, albums };