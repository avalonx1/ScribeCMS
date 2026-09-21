import React, { useRef, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Download,
  Upload,
  Database,
  Globe,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  onNewPost, 
  searchTerm, 
  setSearchTerm,
  dbStatus,
  storageMode,
  onExportAll,
  onImportData,
  onOpenDrawer
}) {
  const fileInputRef = useRef(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (onImportData) onImportData(json);
        } catch {
          alert('Format file JSON tidak valid');
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto gap-2">
        
        {/* Left Side: Mobile Hamburger Menu & Brand */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Drawer Trigger */}
          <button
            onClick={onOpenDrawer}
            className="md:hidden p-2 -ml-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Buka Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand */}
          <div 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="h-8 w-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm tracking-tighter shrink-0 shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">ScribeCMS</span>
                <span className="hidden sm:inline text-[10px] text-zinc-500 font-mono">
                  {storageMode === 'postgres' ? '/ postgres' : '/ browser storage'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari catatan atau materi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
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
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Cari Artikel"
            className={`md:hidden p-2 rounded-xl border transition-colors ${
              isMobileSearchOpen || searchTerm 
                ? 'bg-zinc-800 text-emerald-400 border-zinc-700' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800/80'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Storage Mode Indicator (Tablet & Desktop) */}
          <div 
            title={storageMode === 'postgres' ? 'Terhubung ke PostgreSQL Database lokal' : 'Berjalan di Browser Storage'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800/80 text-[11px]"
          >
            {storageMode === 'postgres' ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-300 font-mono">Postgres</span>
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-400 font-mono">Browser</span>
              </>
            )}
          </div>

          {/* Import JSON (Desktop & Tablet) */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import Backup JSON"
            className="hidden sm:flex p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>

          {/* Export JSON (Desktop & Tablet) */}
          <button
            onClick={onExportAll}
            title="Export Backup JSON"
            className="hidden sm:flex p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* New Post Button (Responsive: icon on mobile, label on sm+) */}
          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">Catatan Baru</span>
            <span className="xs:hidden">Baru</span>
          </button>

        </div>

      </div>

      {/* Expandable Mobile Search Row */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-zinc-800/50 bg-[#0b0f19] animate-fadeIn">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari catatan, tag, atau course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            ) : (
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
