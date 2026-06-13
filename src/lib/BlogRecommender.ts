import type { CollectionEntry } from "astro:content";

import embeddings from "../../public/embeddings.json";

type BlogPost = CollectionEntry<"blog">;

type Embedding = {
  id: string;
  vector: number[];
};

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));

  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dot / (magnitudeA * magnitudeB);
}

function buildTopicVector(topics: string[], allTopics: string[]) {
  return allTopics.map((topic) => (topics.includes(topic) ? 1 : 0));
}

function getEmbedding(post: BlogPost) {
  return (embeddings as Embedding[]).find((item) => item.id === post.id);
}

export default function getRecommendedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit = 3,
) {
  const filteredPosts = allPosts.filter((post) => !post.data.isDraft);

  const allTopics = [
    ...new Set(filteredPosts.flatMap((post) => post.data.topics ?? [])),
  ];

  const currentTopics = currentPost.data.topics ?? [];

  const currentTopicVector = buildTopicVector(currentTopics, allTopics);

  const currentEmbedding = getEmbedding(currentPost);

  if (!currentEmbedding) {
    console.warn("No embedding found:", currentPost.id);
  }

  return filteredPosts

    .filter((post) => post.id !== currentPost.id)

    .map((post) => {
      const postTopics = post.data.topics ?? [];

      const topicVector = buildTopicVector(postTopics, allTopics);

      const topicSimilarity = cosineSimilarity(currentTopicVector, topicVector);

      const postEmbedding = getEmbedding(post);

      const embeddingSimilarity =
        currentEmbedding && postEmbedding
          ? cosineSimilarity(currentEmbedding.vector, postEmbedding.vector)
          : 0;

      const daysOld =
        (Date.now() - new Date(post.data.pubDate).getTime()) /
        (1000 * 60 * 60 * 24);

      const recencyBoost = Math.max(0, 1 - daysOld / 365);

      const score =
        embeddingSimilarity * 0.7 + topicSimilarity * 0.2 + recencyBoost * 0.1;

      return {
        post,
        score,
      };
    })

    .sort((a, b) => b.score - a.score)

    .slice(0, limit)

    .map((item) => item.post);
}
