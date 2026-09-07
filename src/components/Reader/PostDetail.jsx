import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  Clock, 
  Star, 
  GraduationCap, 
  Link as LinkIcon, 
  Copy, 
  Download
} from 'lucide-react';
import { getPostFeatureImage } from '../../utils/imageHelper';
import TableOfContents from './TableOfContents';

export default function PostDetail({ 
  post, 
  onBack, 
  onEdit, 
  onToggleFavorite, 
  showToast 
}) {
  if (!post) return null;

  const featureImg = getPostFeatureImage(post);

  // Extract headings for Table of Contents
  const headings = useMemo(() => {
    const lines = (post.content || '').split('\n');
    const list = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        list.push({ level, text, id });
      }
    });
    return list;
  }, [post.content]);

  const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(post.content);
    if (showToast) showToast('Salinan Markdown mentah disalin ke clipboard!');
  };

  const handleExportSingleMD = () => {
    const blob = new Blob([post.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast(`File ${post.slug}.md berhasil di-download!`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0f19] pb-24">
      
      {/* Top Reading Navigation Bar */}
      <div className="sticky top-16 z-30 border-b border-zinc-800/80 bg-[#0b0f19]/90 backdrop-blur-md px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>

          {post.course_name && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-600">/</span>
              <span className="text-emerald-400 font-medium">{post.course_name}</span>
              {post.module_name && (
                <>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-300">{post.module_name}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Reader Actions */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onToggleFavorite(post.id)}
            className={`p-2 rounded-lg border border-zinc-800/80 transition-colors ${
              post.is_favorite 
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' 
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
            title="Bookmark"
          >
            <Star className={`h-3.5 w-3.5 ${post.is_favorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/80 transition-colors"
            title="Salin Markdown"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleExportSingleMD}
            className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/80 transition-colors"
            title="Download .md"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors ml-1"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 pt-8 flex gap-12">
        
        {/* Article Body */}
        <div className="flex-1 max-w-3xl">
          
          {/* FEATURE IMAGE BANNER */}
          {featureImg && (
            <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-zinc-900 border border-zinc-800/80 shadow-2xl">
              <img
                src={featureImg}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-10 pb-8 border-b border-zinc-800/80">
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                {post.category || 'Materi'}
              </span>
              {post.course_name && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{post.course_name}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-5">
              {post.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {post.reading_time || 1} menit baca
                </span>
              </div>

              {post.source_url && (
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Sumber Course</span>
                </a>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-4">
                {post.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Markdown Content */}
          <main className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </main>

        </div>

        {/* Right Sticky TOC Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <TableOfContents headings={headings} />
        </div>

      </div>

    </div>
  );
}
