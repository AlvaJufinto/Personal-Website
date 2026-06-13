import fs from "fs";
import { glob } from "glob";
import matter from "gray-matter";
import path from "path";

import { pipeline } from "@xenova/transformers";

function cleanContent(content: string) {
  return (
    content

      // remove code block
      .replace(/```[\s\S]*?```/g, "")

      // remove astro component
      .replace(/<\w+.*?\/>/g, "")

      // remove html
      .replace(/<[^>]*>/g, "")

      // markdown image
      .replace(/!\[.*?\]\(.*?\)/g, "")

      // markdown link
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

      // remove markdown syntax
      .replace(/[#>*_~`]/g, "")

      // remove url
      .replace(/https?:\/\/\S+/g, "")

      // normalize
      .replace(/\s+/g, " ")

      .trim()
  );
}

async function main() {
  console.log("Loading model...");

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
  );

  console.log("Finding articles...");

  const files = await glob("src/content/blog/**/**/**/*.mdx");

  const embeddings = [];

  for (const file of files) {
    console.log("Processing:", file);

    const raw = fs.readFileSync(file, "utf-8");

    const parsed = matter(raw);

    const title = parsed.data.title ?? "";

    const description = parsed.data.description ?? "";

    const body = parsed.content;

    const text = cleanContent(
      `
        ${title}

        ${description}

        ${body}
        `,
    );

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    embeddings.push({
      id: path.relative("src/content/blog", file).replace(/\.(md|mdx)$/, ""),
      file,
      title,
      vector: Array.from(output.data),
    });
  }

  fs.writeFileSync(
    "public/embeddings.json",
    JSON.stringify(embeddings, null, 2),
  );

  console.log(`Generated ${embeddings.length} embeddings`);
}

main();
