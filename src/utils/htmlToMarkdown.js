import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * Configure Turndown Service with custom rules for Course Tutorials
 * (Video Iframes, HTML5 Video, Course Callouts, GFM Tables, Syntax Highlighting)
 */
export function createCourseMarkdownParser() {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  });

  // Enable GFM (tables, strikethrough, task lists)
  turndown.use(gfm);

  // Preserve and enhance iframe video embeds (YouTube, Vimeo, Loom, Bilibili, etc.)
  turndown.addRule('videoIframe', {
    filter: (node) => {
      return (
        node.nodeName === 'IFRAME' &&
        (node.getAttribute('src') || '').length > 0
      );
    },
    replacement: (content, node) => {
      const src = node.getAttribute('src') || '';
      const title = node.getAttribute('title') || 'Video Tutorial';
      return `\n\n<iframe width="100%" height="420" src="${src}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full rounded-xl my-4 shadow-lg border border-slate-700 aspect-video"></iframe>\n\n`;
    }
  });

  // Preserve HTML5 video tags
  turndown.addRule('html5Video', {
    filter: 'video',
    replacement: (content, node) => {
      const src = node.getAttribute('src') || 
        (node.querySelector('source') ? node.querySelector('source').getAttribute('src') : '');
      if (!src) return '';
      return `\n\n<video controls width="100%" class="w-full rounded-xl my-4 shadow-lg border border-slate-700"><source src="${src}" type="video/mp4">Browser tidak mendukung tag video.</video>\n\n`;
    }
  });

  // Preserve Code blocks with language detection
  turndown.addRule('fencedCodeBlockWithLang', {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      );
    },
    replacement: (content, node) => {
      const codeNode = node.firstChild;
      const className = codeNode.getAttribute('class') || node.getAttribute('class') || '';
      const langMatch = className.match(/language-(\w+)|lang-(\w+)|highlight-(\w+)/);
      const language = langMatch ? (langMatch[1] || langMatch[2] || langMatch[3]) : '';
      const text = codeNode.textContent || '';
      return `\n\`\`\`${language}\n${text.trim()}\n\`\`\`\n\n`;
    }
  });

  // Preserve Course Callouts / Notes / Alerts (common on docs & tutorial sites)
  turndown.addRule('calloutBoxes', {
    filter: (node) => {
      const cls = (node.getAttribute('class') || '').toLowerCase();
      return (
        node.nodeName === 'DIV' &&
        (cls.includes('alert') || cls.includes('callout') || cls.includes('admonition') || cls.includes('note') || cls.includes('tip') || cls.includes('warning'))
      );
    },
    replacement: (content, node) => {
      const text = content.trim();
      if (!text) return '';
      return `\n\n> 💡 **Course Note:**\n> ${text.split('\n').join('\n> ')}\n\n`;
    }
  });

  // Clean and optimize images
  turndown.addRule('responsiveImages', {
    filter: 'img',
    replacement: (content, node) => {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || 'Course Image';
      const title = node.getAttribute('title') ? ` "${node.getAttribute('title')}"` : '';
      if (!src) return '';
      return `\n![${alt}](${src}${title})\n`;
    }
  });

  return turndown;
}

const parserInstance = createCourseMarkdownParser();

/**
 * Smart Paste Converter:
 * Accepts clipboard data event, inspects HTML, converts to clean Markdown,
 * and returns details of media found (videos, images, links).
 */
export function convertCourseClipboardData(clipboardData) {
  const html = clipboardData.getData('text/html');
  const plainText = clipboardData.getData('text/plain');

  if (!html) {
    return {
      isRich: false,
      markdown: plainText,
      stats: { images: 0, videos: 0, links: 0 }
    };
  }

  // Parse stats from HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imagesCount = doc.querySelectorAll('img').length;
  const videosCount = doc.querySelectorAll('iframe, video').length;
  const linksCount = doc.querySelectorAll('a[href]').length;

  try {
    const converted = parserInstance.turndown(html);
    return {
      isRich: true,
      markdown: converted,
      stats: {
        images: imagesCount,
        videos: videosCount,
        links: linksCount
      }
    };
  } catch (err) {
    console.warn('Fallback to plain text paste due to parser error:', err);
    return {
      isRich: false,
      markdown: plainText,
      stats: { images: 0, videos: 0, links: 0 }
    };
  }
}
