import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Star, 
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  selectedCategory, 
  setSelectedCategory, 
  categories = [], 
  stats 
}) {
  return (
    <aside className="w-60 border-r border-zinc-800/80 bg-[#0b0f19] flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      
      {/* Navigation */}
      <div className="p-4 space-y-1">
        <button
          onClick={() => {
            setActiveView('dashboard');
            setSelectedCategory('All');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            activeView === 'dashboard' && selectedCategory === 'All'
              ? 'bg-zinc-850 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            <span>Semua Artikel</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {stats?.totalPosts || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveView('courses')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            activeView === 'courses'
              ? 'bg-zinc-850 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
            <span>Course & Seri</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {stats?.totalCourses || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveView('dashboard');
            setSelectedCategory('Favorites');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            selectedCategory === 'Favorites'
              ? 'bg-zinc-850 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="h-3.5 w-3.5 text-zinc-400" />
            <span>Favorit</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {stats?.totalFavorites || 0}
          </span>
        </button>
      </div>

      {/* Categories */}
      <div className="p-4 border-t border-zinc-800/60 flex-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Kategori</p>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => {
                  setActiveView('dashboard');
                  setSelectedCategory(cat.name);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-zinc-850 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span 
                    className="h-1.5 w-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: cat.color || '#10b981' }} 
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Smart Paste Note */}
      <div className="p-4 border-t border-zinc-800/60">
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium mb-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Smart Rich Paste</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Copy materi dari web course lalu <kbd className="text-[10px] bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">Ctrl+V</kbd> di editor. Video, gambar & link tersimpan otomatis!
          </p>
        </div>
      </div>

    </aside>
  );
}
