import React, { useRef } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Star, 
  StickyNote, 
  X, 
  Upload, 
  Download, 
  Globe, 
  Database,
  Sparkles
} from 'lucide-react';

export default function MobileDrawer({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  stats,
  notesCount = 0,
  storageMode,
  onExportAll,
  onImportData
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (onImportData) onImportData(json);
          onClose();
        } catch {
          alert('Format file JSON tidak valid');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const handleNavClick = (view, cat = null) => {
    setActiveView(view);
    if (cat !== null) {
      setSelectedCategory(cat);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Drawer Content */}
      <div className="relative w-80 max-w-[85vw] bg-[#0e1320] border-r border-zinc-800 flex flex-col h-full z-10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm">
              S
            </div>
            <div>
              <span className="font-semibold text-sm text-white tracking-tight">ScribeCMS</span>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                {storageMode === 'postgres' ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>PostgreSQL</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-2.5 w-2.5 text-cyan-400" />
                    <span className="text-cyan-400">Browser Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Main Views */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Navigasi Utama</p>
            
            <button
              onClick={() => handleNavClick('dashboard', 'All')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'dashboard' && selectedCategory === 'All'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Semua Catatan</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {stats?.totalPosts || 0}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('courses')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'courses'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>Course & Seri</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {stats?.totalCourses || 0}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('notes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'notes'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StickyNote className="h-4 w-4 text-amber-400" />
                <span>Sticky Notes & Ide</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                {notesCount}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('dashboard', 'Favorites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'dashboard' && selectedCategory === 'Favorites'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-amber-400" />
                <span>Catatan Favorit</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {stats?.totalFavorites || 0}
              </span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Kategori Materi</p>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name && activeView === 'dashboard';
                return (
                  <button
                    key={cat.id || cat.name}
                    onClick={() => handleNavClick('dashboard', cat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span 
                        className="h-2 w-2 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color || '#10b981' }} 
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backup & Tools */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Data & Backup</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onExportAll) onExportAll();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                <span>Import</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>ScribeCMS Mobile Responsive</span>
        </div>

      </div>
    </div>
  );
}
