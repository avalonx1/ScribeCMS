/**
 * Video Helper to convert any YouTube, Vimeo, Loom, or MP4 URL into clean Embed code / Markdown
 */
export function generateVideoEmbedSnippet(url, title = 'Course Video') {
  if (!url) return '';
  const trimmed = url.trim();

  // YouTube standard or short
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return `\n\n<iframe width="100%" height="420" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full rounded-xl my-4 shadow-lg border border-slate-700 aspect-video"></iframe>\n\n`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return `\n\n<iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="420" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="w-full rounded-xl my-4 shadow-lg border border-slate-700 aspect-video"></iframe>\n\n`;
  }

  // Loom
  const loomMatch = trimmed.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return `\n\n<iframe src="https://www.loom.com/embed/${videoId}" width="100%" height="420" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen class="w-full rounded-xl my-4 shadow-lg border border-slate-700 aspect-video"></iframe>\n\n`;
  }

  // Raw MP4 / Direct Video
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg')) {
    return `\n\n<video controls width="100%" class="w-full rounded-xl my-4 shadow-lg border border-slate-700"><source src="${trimmed}" type="video/mp4">Browser tidak mendukung video.</video>\n\n`;
  }

  // Generic Iframe fallback
  return `\n\n<iframe width="100%" height="420" src="${trimmed}" title="${title}" frameborder="0" allowfullscreen class="w-full rounded-xl my-4 shadow-lg border border-slate-700 aspect-video"></iframe>\n\n`;
}
