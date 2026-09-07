/**
 * Helper to get feature image for a post or extract from markdown
 */

export const CURATED_COVER_PRESETS = [
  {
    name: 'Minimal Tech & Cloud',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Modern Workspace & Code',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Abstract Fluid Dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Cloud & Infrastructure',
    url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Books & Knowledge Journal',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Clean Architecture & Design',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
  }
];

export function extractFirstImageFromMarkdown(content) {
  if (!content) return null;
  // Match markdown image ![alt](url)
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+|\/uploads\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1];
  }
  // Match HTML img tag <img src="..." />
  const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"'>]+|\/uploads\/[^"'>]+)["']/i);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }
  return null;
}

export function getPostFeatureImage(post) {
  if (post?.cover_image && post.cover_image.trim() !== '') {
    return post.cover_image;
  }
  
  // Try extracting from content
  const extracted = extractFirstImageFromMarkdown(post?.content);
  if (extracted) return extracted;

  // Fallback preset based on category or id
  const categoryLower = (post?.category || '').toLowerCase();
  if (categoryLower.includes('dev') || categoryLower.includes('code') || categoryLower.includes('tech')) {
    return CURATED_COVER_PRESETS[1].url;
  }
  if (categoryLower.includes('course') || categoryLower.includes('video')) {
    return CURATED_COVER_PRESETS[3].url;
  }
  if (categoryLower.includes('journal')) {
    return CURATED_COVER_PRESETS[4].url;
  }

  // Consistent hash based on post id or title length
  const hash = Math.abs((post?.id || post?.title?.length || 0) % CURATED_COVER_PRESETS.length);
  return CURATED_COVER_PRESETS[hash].url;
}
