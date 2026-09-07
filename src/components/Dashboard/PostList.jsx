import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Star, 
  Edit3, 
  Trash2, 
  Video, 
  GraduationCap, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getPostFeatureImage } from '../../utils/imageHelper';

export default function PostList({ 
  posts = [], 
  loading, 
  onSelectPost, 
  onEditPost, 
  onDeletePost, 
  onToggleFavorite,
  onNewPost,
  selectedCategory,
  searchTerm
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-80 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/20 max-w-xl mx-auto my-8">
        <div className="h-12 w-12 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Belum ada catatan</h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          {searchTerm 
            ? `Tidak ada artikel yang cocok dengan pencarian "${searchTerm}".`
            : `Mulai simpan materi kursus online atau catatan harian Anda.`
          }
        </p>
        <button
          onClick={onNewPost}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tulis Catatan Baru</span>
        </button>
      </div>
    );
  }

  // Highlight post: prioritize favorite or the first post
  const highlightPost = !searchTerm && selectedCategory === 'All' 
    ? (posts.find(p => p.is_favorite) || posts[0])
    : null;

  // Other posts excluding highlightPost if in default view
  const regularPosts = highlightPost 
    ? posts.filter(p => p.id !== highlightPost.id)
    : posts;

  return (
    <div className="space-y-10">
      
      {/* 1. HERO HIGHLIGHT ARTICLE CARD (with Feature Image) */}
      {highlightPost && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                ★ Highlight Artikel
              </span>
            </div>
          </div>

          <div 
            onClick={() => onSelectPost(highlightPost)}
            className="group relative editorial-card rounded-2xl overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 shadow-xl"
          >
            {/* Feature Image Banner */}
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto overflow-hidden bg-zinc-900">
              <img
                src={getPostFeatureImage(highlightPost)}
                alt={highlightPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent lg:hidden" />
              
              {/* Media badge floating on image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md text-white border border-white/10">
                  {highlightPost.category || 'Materi Course'}
                </span>
                {(highlightPost.content?.includes('<iframe') || highlightPost.content?.includes('<video')) && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                    <Video className="h-3 w-3" />
                    <span>Video Embed</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between bg-zinc-900/60 backdrop-blur-sm">
              <div>
                {highlightPost.course_name && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-3">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{highlightPost.course_name}</span>
                    {highlightPost.module_name && (
                      <>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-400">{highlightPost.module_name}</span>
                      </>
                    )}
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-snug mb-3">
                  {highlightPost.title}
                </h2>

                <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-normal">
                  {highlightPost.summary || highlightPost.content.replace(/#|\*|`|<[^>]*>/g, '').slice(0, 180) + '...'}
                </p>

                {highlightPost.tags && highlightPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {highlightPost.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Meta & Action */}
              <div className="pt-5 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    {new Date(highlightPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    {highlightPost.reading_time || 1} mnt baca
                  </span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFavorite(highlightPost.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      highlightPost.is_favorite ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Bookmark"
                  >
                    <Star className={`h-4 w-4 ${highlightPost.is_favorite ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => onEditPost(highlightPost)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onSelectPost(highlightPost)}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors ml-1"
                  >
                    <span>Baca</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 2. REGULAR ARTICLE CARDS WITH FEATURED IMAGES */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-white tracking-tight">
              {selectedCategory === 'All' ? 'Semua Catatan' : selectedCategory}
            </h3>
            <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              {posts.length} artikel
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'compact' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => {
              const featureImg = getPostFeatureImage(post);
              const hasVideo = post.content?.includes('<iframe') || post.content?.includes('<video');
              const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <article
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="group editorial-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300"
                >
                  {/* Card Feature Image */}
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      <img
                        src={featureImg}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Badges on top of feature image */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-zinc-200 border border-white/10">
                          {post.category || 'Materi'}
                        </span>
                        {hasVideo && (
                          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                            <Video className="h-3 w-3" />
                            <span>Video</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      {post.course_name && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-2 truncate">
                          <GraduationCap className="h-3 w-3 shrink-0" />
                          <span className="truncate">{post.course_name}</span>
                        </div>
                      )}

                      <h4 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2">
                        {post.title}
                      </h4>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                        {post.summary || post.content.replace(/#|\*|`|<[^>]*>/g, '').slice(0, 120) + '...'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div 
                    className="px-5 py-3 border-t border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <span>{formattedDate}</span>
                      <span>·</span>
                      <span>{post.reading_time || 1} mnt</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(post.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          post.is_favorite ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title="Bookmark"
                      >
                        <Star className={`h-3.5 w-3.5 ${post.is_favorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => onEditPost(post)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus catatan "${post.title}"?`)) onDeletePost(post.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        ) : (
          /* Compact View with thumbnail feature image */
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 divide-y divide-zinc-800/60 overflow-hidden">
            {regularPosts.map((post) => {
              const featureImg = getPostFeatureImage(post);
              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="p-4 hover:bg-zinc-850 cursor-pointer flex items-center justify-between gap-4 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                      <img src={featureImg} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {post.course_name ? `${post.course_name} · ` : ''}{post.summary || post.content.slice(0, 90)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500" onClick={(e) => e.stopPropagation()}>
                    <span className="hidden sm:inline">
                      {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(post.id)}
                      className={`p-1.5 rounded-lg ${post.is_favorite ? 'text-amber-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <Star className={`h-3.5 w-3.5 ${post.is_favorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => onEditPost(post)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
