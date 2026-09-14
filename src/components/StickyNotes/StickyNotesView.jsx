import React, { useState, useRef, useEffect } from 'react';
import { 
  StickyNote, 
  Search, 
  Plus, 
  Pin, 
  Palette, 
  Tag as TagIcon, 
  Check, 
  X, 
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  CheckSquare
} from 'lucide-react';
import StickyNoteCard from './StickyNoteCard';
import StickyNoteModal from './StickyNoteModal';
import { NOTE_COLORS, getNoteColor } from './noteColors';
import { insertChecklist, handleSmartEnter } from './checklistHelper';

export default function StickyNotesView({
  notes = [],
  onSaveNote,
  onDeleteNote,
  onTogglePinNote,
  onReorderNotes,
  showToast
}) {
  // Local Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // "Take a Note" Top Box Expansion State
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('default');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newTags, setNewTags] = useState([]);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInputText, setTagInputText] = useState('');

  // Modal State for Editing / Viewing note details
  const [selectedNote, setSelectedNote] = useState(null);

  // Drag and Drop States
  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOverNoteId, setDragOverNoteId] = useState(null);

  const takeNoteRef = useRef(null);
  const newContentRef = useRef(null);

  // Auto-resize content textarea when expanded
  useEffect(() => {
    if (isExpanded && newContentRef.current) {
      newContentRef.current.style.height = 'auto';
      newContentRef.current.style.height = `${Math.max(80, newContentRef.current.scrollHeight)}px`;
    }
  }, [newContent, isExpanded]);

  // Handle click outside "Take a note" to auto-save and collapse
  useEffect(() => {
    function handleClickOutside(event) {
      if (takeNoteRef.current && !takeNoteRef.current.contains(event.target)) {
        if (isExpanded) {
          handleSaveQuickNote();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, newTitle, newContent, newColor, newIsPinned, newTags]);

  // Collect all unique tags across all notes
  const allTags = React.useMemo(() => {
    const tagsSet = new Set();
    notes.forEach(note => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filter notes by search & selected tag
  const filteredNotes = React.useMemo(() => {
    return notes.filter(note => {
      // Search query
      const matchesSearch = !searchTerm || (
        (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.tags && note.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
      );

      // Tag filter
      const matchesTag = selectedTag === 'All' || (
        note.tags && note.tags.includes(selectedTag)
      );

      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const otherNotes = filteredNotes.filter(n => !n.is_pinned);

  // Save new quick note from top bar
  const handleSaveQuickNote = () => {
    if (newTitle.trim() || newContent.trim() || newTags.length > 0) {
      onSaveNote({
        title: newTitle.trim(),
        content: newContent.trim(),
        color: newColor,
        is_pinned: newIsPinned,
        tags: newTags
      });
      if (showToast) showToast('Catatan ide baru disimpan!');
    }
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewColor('default');
    setNewIsPinned(false);
    setNewTags([]);
    setShowColorMenu(false);
    setShowTagInput(false);
    setTagInputText('');
    setIsExpanded(false);
  };

  const handleAddNewTag = (e) => {
    e?.preventDefault();
    let clean = tagInputText.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (!newTags.includes(clean)) {
      setNewTags([...newTags, clean]);
    }
    setTagInputText('');
    setShowTagInput(false);
  };

  const handleRemoveNewTag = (tagToRemove) => {
    setNewTags(newTags.filter(t => t !== tagToRemove));
  };

  const handleInsertQuickChecklist = () => {
    setIsExpanded(true);
    if (newContentRef.current) {
      const start = newContentRef.current.selectionStart;
      const end = newContentRef.current.selectionEnd;
      const res = insertChecklist(newContent, start, end);
      setNewContent(res.content);
      setTimeout(() => {
        if (newContentRef.current) {
          newContentRef.current.focus();
          newContentRef.current.selectionStart = newContentRef.current.selectionEnd = res.cursor;
        }
      }, 0);
    } else {
      const res = insertChecklist(newContent);
      setNewContent(res.content);
    }
  };

  // Card action helpers
  const handleCardUpdateColor = (noteId, colorId) => {
    const target = notes.find(n => n.id === noteId);
    if (target) {
      onSaveNote({ ...target, color: colorId });
    }
  };

  const handleCardAddTag = (noteId, tag) => {
    const target = notes.find(n => n.id === noteId);
    if (target) {
      const currentTags = Array.isArray(target.tags) ? target.tags : [];
      if (!currentTags.includes(tag)) {
        onSaveNote({ ...target, tags: [...currentTags, tag] });
      }
    }
  };

  const handleCardRemoveTag = (noteId, tagToRemove) => {
    const target = notes.find(n => n.id === noteId);
    if (target && Array.isArray(target.tags)) {
      onSaveNote({ ...target, tags: target.tags.filter(t => t !== tagToRemove) });
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', note.id.toString());
  };

  const handleDragOver = (e, targetNote) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedNote && draggedNote.id !== targetNote.id) {
      setDragOverNoteId(targetNote.id);
    }
  };

  const handleDrop = (e, targetNote) => {
    e.preventDefault();
    setDragOverNoteId(null);

    if (!draggedNote || draggedNote.id === targetNote.id) {
      setDraggedNote(null);
      return;
    }

    // Reorder array
    const newNotesList = [...notes];
    const sourceIdx = newNotesList.findIndex(n => n.id === draggedNote.id);
    const targetIdx = newNotesList.findIndex(n => n.id === targetNote.id);

    if (sourceIdx < 0 || targetIdx < 0) return;

    // Remove source and insert at target
    const [moved] = newNotesList.splice(sourceIdx, 1);
    
    // Inherit target's pinned status if moving between sections
    moved.is_pinned = targetNote.is_pinned;

    newNotesList.splice(targetIdx, 0, moved);

    // Update positions
    const reorderedPayload = newNotesList.map((item, index) => ({
      id: item.id,
      position: index,
      is_pinned: item.is_pinned
    }));

    onReorderNotes(reorderedPayload);
    setDraggedNote(null);
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
    setDragOverNoteId(null);
  };

  const quickBoxColor = getNoteColor(newColor);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
      
      {/* Top Header: Title, Counts, Search & Tag Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <StickyNote className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Sticky Notes & Ide</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                {notes.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Tangkap ide kilat, to-do list, dan konsep materi dengan fleksibilitas ala Google Keep.
            </p>
          </div>

          {/* Quick In-Page Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari dalam catatan atau tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
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

        {/* Tag Filters Bar */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-4 pb-1 no-scrollbar">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mr-2 shrink-0">
              Filter Tag:
            </span>
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedTag === 'All'
                  ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              Semua ({notes.length})
            </button>
            {allTags.map((tag) => {
              const count = notes.filter(n => n.tags && n.tags.includes(tag)).length;
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isActive ? 'All' : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  <span>{tag}</span>
                  <span className={`text-[10px] ${isActive ? 'text-zinc-900/80' : 'text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Keep "Take a Note..." Bar */}
      <div className="max-w-2xl mx-auto w-full mb-10">
        <div
          ref={takeNoteRef}
          className={`rounded-2xl border transition-all duration-200 shadow-xl overflow-hidden ${
            quickBoxColor.borderClass
          } ${quickBoxColor.bgClass}`}
        >
          {!isExpanded ? (
            /* Collapsed State */
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center justify-between px-5 py-3 cursor-text group"
            >
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300 font-medium select-none">
                Tulis ide atau catatan cepat...
              </span>
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    setNewContent(prev => prev ? prev + '\n- [ ] ' : '- [ ] ');
                    setTimeout(() => newContentRef.current?.focus(), 50);
                  }}
                  title="Buat Catatan dengan Checklist"
                  className="p-1.5 rounded-lg hover:text-emerald-400 hover:bg-white/10 transition-colors"
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    setNewTags(['#todo']);
                  }}
                  title="Catatan To-Do"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    setShowColorMenu(true);
                  }}
                  title="Pilih Warna"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded State */
            <div className="p-5 flex flex-col gap-3">
              {/* Header Title + Pin Button */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Judul catatan..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-transparent text-base font-bold text-white placeholder-zinc-500 focus:outline-none tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => setNewIsPinned(!newIsPinned)}
                  title={newIsPinned ? 'Lepas Pin' : 'Pin Catatan ke Atas'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    newIsPinned 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Pin className={`h-4 w-4 ${newIsPinned ? 'fill-amber-400 rotate-45' : ''}`} />
                </button>
              </div>

              {/* Content Textarea */}
              <textarea
                ref={newContentRef}
                placeholder="Tulis catatan atau ide di sini... (tekan ikon checklist atau ketik '- [ ] ')"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                onKeyDown={(e) => handleSmartEnter(e, newContent, setNewContent)}
                autoFocus
                className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed min-h-[80px]"
              />

              {/* Tag Pills */}
              {(newTags.length > 0 || showTagInput) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {newTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-black/30 border border-white/10 text-zinc-300"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewTag(tag)}
                        className="hover:text-rose-400"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}

                  {showTagInput ? (
                    <form onSubmit={handleAddNewTag} className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="nama tag (e.g. ide)"
                        value={tagInputText}
                        onChange={(e) => setTagInputText(e.target.value)}
                        autoFocus
                        className="px-2 py-0.5 rounded text-xs bg-black/40 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none w-24"
                      />
                      <button type="submit" className="p-1 rounded bg-zinc-800 text-zinc-300">
                        <Check className="h-3 w-3" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs text-zinc-400 hover:text-white border border-dashed border-zinc-700"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Tag</span>
                    </button>
                  )}
                </div>
              )}

              {/* Color Picker Bar if active */}
              {showColorMenu && (
                <div className="py-2 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setNewColor(c.id);
                        setShowColorMenu(false);
                      }}
                      title={c.name}
                      className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${
                        newColor === c.id ? 'ring-2 ring-white scale-105' : ''
                      }`}
                      style={{ 
                        backgroundColor: c.dotColor,
                        borderColor: newColor === c.id ? '#fff' : 'rgba(255,255,255,0.2)' 
                      }}
                    >
                      {newColor === c.id && <Check className="h-2.5 w-2.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Expanded Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleInsertQuickChecklist}
                    title="Sisipkan Checklist (- [ ])"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Checklist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColorMenu(!showColorMenu)}
                    title="Pilih Warna"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Palette className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagInput(!showTagInput)}
                    title="Tambah Tag"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <TagIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickNote}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NOTES GRID CONTAINER */}
      <div className="flex-1 space-y-10">
        
        {/* Section 1: PINNED NOTES */}
        {pinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <Pin className="h-3 w-3 fill-amber-400" />
                DIPIN ({pinnedNotes.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pinnedNotes.map((note) => (
                <StickyNoteCard
                  key={note.id}
                  note={note}
                  onSelect={setSelectedNote}
                  onTogglePin={onTogglePinNote}
                  onUpdateColor={handleCardUpdateColor}
                  onDelete={onDeleteNote}
                  onAddTag={handleCardAddTag}
                  onRemoveTag={handleCardRemoveTag}
                  onFilterByTag={(t) => setSelectedTag(t)}
                  onSaveNote={onSaveNote}
                  isDragging={draggedNote?.id === note.id}
                  isDragOver={dragOverNoteId === note.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  showToast={showToast}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: OTHER NOTES */}
        {otherNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  LAINNYA ({otherNotes.length})
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherNotes.map((note) => (
                <StickyNoteCard
                  key={note.id}
                  note={note}
                  onSelect={setSelectedNote}
                  onTogglePin={onTogglePinNote}
                  onUpdateColor={handleCardUpdateColor}
                  onDelete={onDeleteNote}
                  onAddTag={handleCardAddTag}
                  onRemoveTag={handleCardRemoveTag}
                  onFilterByTag={(t) => setSelectedTag(t)}
                  onSaveNote={onSaveNote}
                  isDragging={draggedNote?.id === note.id}
                  isDragOver={dragOverNoteId === note.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  showToast={showToast}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 shadow-inner">
              <StickyNote className="h-8 w-8 stroke-1" />
            </div>
            <h3 className="text-base font-semibold text-zinc-300 mb-1">
              {searchTerm || selectedTag !== 'All' 
                ? 'Tidak ada catatan yang sesuai dengan filter' 
                : 'Belum ada sticky note atau ide tersimpan'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              {searchTerm || selectedTag !== 'All'
                ? 'Coba ubah kata kunci pencarian atau reset filter tag.'
                : 'Catatan yang Anda tambahkan di atas akan muncul di sini layaknya Google Keep.'}
            </p>
            {searchTerm || selectedTag !== 'All' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('All');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors"
              >
                Reset Filter
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsExpanded(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Buat Catatan Pertama</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Google Keep-style Popup Editor Modal */}
      <StickyNoteModal
        note={selectedNote}
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onSave={(updated) => {
          onSaveNote(updated);
          if (showToast) showToast('Catatan berhasil diperbarui!');
        }}
        onDelete={(id) => {
          onDeleteNote(id);
          if (showToast) showToast('Catatan telah dihapus');
        }}
      />

    </div>
  );
}
