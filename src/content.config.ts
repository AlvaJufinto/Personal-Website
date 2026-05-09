/** @format */

import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      isDraft: z.boolean().optional().default(false),
      topics: z.array(z.string()).default([]).optional(),
      language: z.string().default("en").optional(),
    }),
});

const work = defineCollection({
  // Load Markdown and MDX files in the `src/content/work/` directory.
  loader: glob({ base: "./src/content/work", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.array(z.string()).default([]).optional(),
      tech: z.array(z.string()).default([]).optional(),
      heroImage: image().optional(),

      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      isDraft: z.boolean().optional().default(false),
    }),
});

export const collections = { blog, work };
