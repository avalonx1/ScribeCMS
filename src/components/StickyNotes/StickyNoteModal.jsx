import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Pin, 
  Palette, 
  Tag as TagIcon, 
  Trash2, 
  X, 
  Plus, 
  Check,
  Clock,
  CheckSquare,
  Edit3
} from 'lucide-react';
import { NOTE_COLORS, getNoteColor } from './noteColors';
import { 
  parseNoteContent, 
  toggleChecklistAtLine, 
  insertChecklist, 
  handleSmartEnter, 
  getChecklistStats 
} from './checklistHelper';

export default function StickyNoteModal({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState([]);
  const [viewMode, setViewMode] = useState('write'); // 'write' | 'interactive'
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || 'default');
      setIsPinned(!!note.is_pinned);
      setTags(Array.isArray(note.tags) ? [...note.tags] : []);
    } else {
      setTitle('');
      setContent('');
      setColor('default');
      setIsPinned(false);
      setTags([]);
    }
    setViewMode('write');
    setShowColorPicker(false);
    setShowTagInput(false);
    setNewTagText('');
  }, [note, isOpen]);

  // Checklist stats & parsed lines
  const parsedLines = useMemo(() => parseNoteContent(content), [content]);
  const checklistStats = useMemo(() => getChecklistStats(content), [content]);

  // Auto resize textarea
  useEffect(() => {
    if (viewMode === 'write' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [content, isOpen, viewMode]);

  if (!isOpen) return null;

  const currentColorConfig = getNoteColor(color);

  const handleSaveAndClose = () => {
    if (title.trim() || content.trim() || tags.length > 0) {
      onSave({
        ...note,
        title: title.trim(),
        content: content.trim(),
        color,
        is_pinned: isPinned,
        tags
      });
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleSaveAndClose();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSaveAndClose();
    }
  };

  const handleInsertChecklist = () => {
    setViewMode('write');
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const res = insertChecklist(content, start, end);
      setContent(res.content);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = res.cursor;
        }
      }, 0);
    } else {
      const res = insertChecklist(content);
      setContent(res.content);
    }
  };

  const handleToggleTodo = (lineIndex) => {
    const updated = toggleChecklistAtLine(content, lineIndex);
    setContent(updated);
  };

  const handleAddTag = (e) => {
    e?.preventDefault();
    let cleaned = newTagText.trim();
    if (!cleaned) return;
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned;
    }
    if (!tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setNewTagText('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const formattedDate = note?.updated_at || note?.created_at
    ? new Date(note.updated_at || note.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Baru';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSaveAndClose();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div 
        ref={modalRef}
        className={`w-full max-w-2xl rounded-2xl border ${currentColorConfig.borderClass} ${currentColorConfig.bgClass} shadow-2xl flex flex-col max-h-[93vh] overflow-hidden transition-colors duration-200`}
      >
        {/* Header: Title, Checklist Mode Switcher & Pin button */}
        <div className="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-2 gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Judul catatan..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent text-lg sm:text-xl font-bold text-white placeholder-zinc-500 focus:outline-none tracking-tight"
            autoFocus
          />
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher if checklist exists */}
            {checklistStats.total > 0 && (
              <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('write')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                    viewMode === 'write' ? 'bg-white/20 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('interactive')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                    viewMode === 'interactive' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CheckSquare className="h-3 w-3 text-emerald-400" />
                  <span>{checklistStats.completed}/{checklistStats.total}</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Lepas Pin' : 'Pin Catatan ke Atas'}
              className={`p-2 rounded-xl transition-all ${
                isPinned 
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Pin className={`h-4 w-4 ${isPinned ? 'fill-amber-400 rotate-45' : ''} transition-transform`} />
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors sm:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 py-2 flex-1 overflow-y-auto">
          {viewMode === 'write' ? (
            /* Write Mode: Auto-expanding Textarea with smart Enter */
            <textarea
              ref={textareaRef}
              placeholder="Tulis catatan di sini... (tekan ikon checklist di bawah atau ketik '- [ ] ' untuk membuat checklist)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => handleSmartEnter(e, content, setContent)}
              className="w-full bg-transparent text-sm sm:text-base text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed min-h-[140px]"
            />
          ) : (
            /* Interactive Mode: Clickable Checklists and formatted text */
            <div className="py-1 space-y-2 min-h-[140px]">
              {parsedLines.map((lineItem, idx) => {
                if (lineItem.type === 'todo') {
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleTodo(lineItem.lineIndex)}
                      className="flex items-start gap-3 py-1.5 px-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors select-none group/item"
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                        lineItem.checked 
                          ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-sm' 
                          : 'border-zinc-500 group-hover/item:border-zinc-300 bg-black/30'
                      }`}>
                        {lineItem.checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className={`text-sm sm:text-base leading-snug break-words flex-1 transition-all ${
                        lineItem.checked ? 'line-through text-zinc-500' : 'text-zinc-100'
                      }`}>
                        {lineItem.text}
                      </span>
                    </div>
                  );
                }

                if (!lineItem.text.trim()) {
                  return <div key={idx} className="h-2" />;
                }

                return (
                  <p key={idx} className="text-sm sm:text-base text-zinc-300 whitespace-pre-wrap leading-relaxed px-2">
                    {lineItem.text}
                  </p>
                );
              })}

              <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInsertChecklist}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Item Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('write')}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Buka Editor Teks
                </button>
              </div>
            </div>
          )}

          {/* Tags Chips Display */}
          {(tags.length > 0 || showTagInput) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 pb-2">
              {tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/30 border border-white/10 text-zinc-300 backdrop-blur-sm group"
                >
                  <span>{tag}</span>
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-500 hover:text-rose-400 ml-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {showTagInput ? (
                <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="nama tag (e.g. ide)"
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    autoFocus
                    className="px-2.5 py-0.5 rounded-lg text-xs bg-black/40 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-28"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagInput(false)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tag</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Color Picker Drawer if open */}
        {showColorPicker && (
          <div className="px-4 sm:px-6 py-2 border-t border-white/5 bg-black/20 flex items-center gap-2 flex-wrap animate-fadeIn">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Pilih Warna:</span>
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setColor(c.id);
                  setShowColorPicker(false);
                }}
                title={c.name}
                className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${
                  color === c.id ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-950 scale-105' : ''
                }`}
                style={{ 
                  backgroundColor: c.dotColor,
                  borderColor: color === c.id ? '#ffffff' : 'rgba(255,255,255,0.2)' 
                }}
              >
                {color === c.id && <Check className="h-3 w-3 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        )}

        {/* Modal Footer: Action Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/5 bg-black/20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            {/* Checklist Button */}
            <button
              type="button"
              onClick={handleInsertChecklist}
              title="Sisipkan Checklist (- [ ])"
              className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Checklist</span>
            </button>

            {/* Palette Button */}
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Ganti Warna Catatan"
              className={`p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ${
                showColorPicker ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Palette className="h-4 w-4" />
            </button>

            {/* Tag Button */}
            <button
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              title="Tambah Tag / Label"
              className={`p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ${
                showTagInput ? 'bg-white/10 text-white' : ''
              }`}
            >
              <TagIcon className="h-4 w-4" />
            </button>

            {/* Delete Button (only if existing note) */}
            {note?.id && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus catatan ini?')) {
                    onDelete(note.id);
                    onClose();
                  }
                }}
                title="Hapus Catatan"
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* Last Edited Timestamp */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 pl-2">
              <Clock className="h-3 w-3" />
              <span>Diedit {formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Tutup & Simpan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
