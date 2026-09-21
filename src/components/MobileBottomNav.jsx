import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  StickyNote, 
  Menu,
  Plus
} from 'lucide-react';

export default function MobileBottomNav({
  activeView,
  setActiveView,
  onOpenDrawer,
  onNewPost,
  notesCount = 0
}) {
  // Hide on editor and reader mode to avoid cluttering reading/typing experience
  if (activeView === 'editor') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0b0f19]/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Artikel */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
            activeView === 'dashboard'
              ? 'text-emerald-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className={`h-5 w-5 mb-0.5 ${activeView === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Artikel</span>
        </button>

        {/* 2. Courses */}
        <button
          onClick={() => setActiveView('courses')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
            activeView === 'courses'
              ? 'text-emerald-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GraduationCap className={`h-5 w-5 mb-0.5 ${activeView === 'courses' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Course</span>
        </button>

        {/* 3. Center Quick Add Button */}
        <button
          onClick={onNewPost}
          className="flex items-center justify-center h-11 w-11 -mt-4 rounded-full bg-white text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-200 active:scale-95 transition-all"
          title="Tulis Catatan Baru"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        {/* 4. Sticky Notes */}
        <button
          onClick={() => setActiveView('notes')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all relative ${
            activeView === 'notes'
              ? 'text-amber-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <StickyNote className={`h-5 w-5 mb-0.5 ${activeView === 'notes' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Notes</span>
          {notesCount > 0 && (
            <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#0b0f19]" />
          )}
        </button>

        {/* 5. Menu / Kategori Drawer */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <Menu className="h-5 w-5 mb-0.5 stroke-2" />
          <span>Menu</span>
        </button>

      </div>
    </nav>
  );
}
