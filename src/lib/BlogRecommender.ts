// src/lib/blogRecommender.ts

import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => {
    return sum + val * b[i];
  }, 0);

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

export default function getRecommendedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3,
) {
  const filteredPost = allPosts.filter((post) => !post.data.isDraft);

  const allTopics = [
    ...new Set(filteredPost.flatMap((post) => post.data.topics || [])),
  ];

  const currentTopics = currentPost.data.topics || [];

  const currentVector = buildTopicVector(currentTopics, allTopics);

  return filteredPost
    .filter((post) => post.id !== currentPost.id)
    .map((post) => {
      const postTopics = post.data.topics || [];

      const vector = buildTopicVector(postTopics, allTopics);

      // cosine similarity
      const similarity = cosineSimilarity(currentVector, vector);

      // shared topic boost
      const sharedTopics = postTopics.filter((topic) =>
        currentTopics.includes(topic),
      ).length;

      // recency boost
      const daysOld =
        (Date.now() - new Date(post.data.pubDate).getTime()) /
        (1000 * 60 * 60 * 24);

      const recencyBoost = Math.max(0, 1 - daysOld / 365);

      // final weighted score
      const score = similarity * 0.8 + sharedTopics * 0.1 + recencyBoost * 0.1;

      return {
        post,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}
