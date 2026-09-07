import React, { useState } from 'react';
import { Video, Youtube, Link, X, Check } from 'lucide-react';
import { generateVideoEmbedSnippet } from '../../utils/videoHelper';

export default function VideoModal({ isOpen, onClose, onInsertVideo }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    const snippet = generateVideoEmbedSnippet(videoUrl, videoTitle || 'Course Video Tutorial');
    onInsertVideo(snippet);
    setVideoUrl('');
    setVideoTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Embed Video Course</h3>
            <p className="text-xs text-slate-400">YouTube, Vimeo, Loom, atau direct .mp4 URL</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Video / Link Tutorial <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Contoh: https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Judul Video (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Modul 1 - Setup Project"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">💡 Tips Cerdas:</p>
            <p>Jika Anda melakukan <strong>Copy All</strong> pada halaman website course online, video iframe akan otomatis tertangkap dan tidak perlu di-embed manual satu per satu.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/20"
            >
              <Check className="h-4 w-4" />
              <span>Sematkan Video</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
