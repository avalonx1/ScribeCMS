import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Download,
  Database
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  onNewPost, 
  searchTerm, 
  setSearchTerm,
  dbStatus,
  onExportAll
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 sm:px-8 max-w-7xl mx-auto">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="h-8 w-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm tracking-tighter">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">ScribeCMS</span>
              <span className="text-[10px] text-zinc-500 font-mono">/ postgres</span>
            </div>
          </div>
        </div>

        {/* Minimal Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari catatan atau materi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          
          {/* DB Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800/80 text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${dbStatus === 'online' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span className="text-zinc-400 font-mono">app_blog</span>
          </div>

          <button
            onClick={onExportAll}
            title="Export Backup JSON"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Catatan Baru</span>
          </button>

        </div>

      </div>
    </header>
  );
}
