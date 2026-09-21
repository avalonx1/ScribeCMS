import React, { useState, useRef, useMemo } from 'react';
import { 
  Pin, 
  Palette, 
  Tag as TagIcon, 
  Trash2, 
  Copy, 
  Check, 
  GripVertical,
  X,
  Plus,
  CheckSquare
} from 'lucide-react';
import { NOTE_COLORS, getNoteColor } from './noteColors';
import { parseNoteContent, toggleChecklistAtLine, getChecklistStats } from './checklistHelper';

export default function StickyNoteCard({
  note,
  onSelect,
  onTogglePin,
  onUpdateColor,
  onDelete,
  onAddTag,
  onRemoveTag,
  onFilterByTag,
  onSaveNote,
  // Drag & Drop props
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  showToast
}) {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [copied, setCopied] = useState(false);

  const colorConfig = getNoteColor(note.color);

  // Parse lines for hybrid free text + checklist items
  const parsedLines = useMemo(() => parseNoteContent(note.content), [note.content]);
  const checklistStats = useMemo(() => getChecklistStats(note.content), [note.content]);

  const handleToggleTodo = (lineIndex) => {
    const updatedContent = toggleChecklistAtLine(note.content, lineIndex);
    if (onSaveNote) {
      onSaveNote({ ...note, content: updatedContent });
    }
  };

  const handleCopyText = (e) => {
    e.stopPropagation();
    const textToCopy = `${note.title ? note.title + '\n\n' : ''}${note.content || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (showToast) showToast('Isi catatan disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTagSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let cleaned = newTag.trim();
    if (!cleaned) return;
    if (!cleaned.startsWith('#')) cleaned = '#' + cleaned;
    if (onAddTag) onAddTag(note.id, cleaned);
    setNewTag('');
    setShowTagMenu(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, note)}
      onDragOver={(e) => onDragOver && onDragOver(e, note)}
      onDrop={(e) => onDrop && onDrop(e, note)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(note)}
      className={`group relative rounded-2xl border ${colorConfig.borderClass} ${colorConfig.bgClass} p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 select-none ${
        isDragging ? 'opacity-40 scale-95 ring-2 ring-dashed ring-zinc-500' : ''
      } ${
        isDragOver ? 'ring-2 ring-emerald-400 border-emerald-400/80 scale-[1.02]' : ''
      }`}
    >
      {/* Top Header: Title & Pin Button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {note.title ? (
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight leading-snug line-clamp-2">
                {note.title}
              </h3>
            ) : null}

            {/* Checklist progress badge if contains checklist */}
            {checklistStats.total > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                  <CheckSquare className="h-2.5 w-2.5 text-emerald-400" />
                  <span>{checklistStats.completed}/{checklistStats.total} selesai</span>
                </span>
              </div>
            )}
          </div>

          {/* Pin Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            title={note.is_pinned ? 'Lepas Pin' : 'Sematkan Pin'}
            className={`p-1.5 rounded-lg transition-opacity shrink-0 ${
              note.is_pinned 
                ? 'opacity-100 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' 
                : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Pin className={`h-3.5 w-3.5 ${note.is_pinned ? 'fill-amber-400 rotate-45' : ''}`} />
          </button>
        </div>

        {/* Content & Hybrid Checklist Rendering */}
        {note.content && (
          <div className="space-y-1 mb-3">
            {parsedLines.slice(0, 7).map((lineItem, idx) => {
              if (lineItem.type === 'todo') {
                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTodo(lineItem.lineIndex);
                    }}
                    className="flex items-start gap-2 py-0.5 group/todo cursor-pointer select-none rounded hover:bg-white/5 px-1 -mx-1 transition-colors"
                  >
                    <div className={`mt-0.5 h-3.5 w-3.5 rounded border shrink-0 flex items-center justify-center transition-all ${
                      lineItem.checked 
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-sm' 
                        : 'border-zinc-500 hover:border-zinc-300 bg-black/30'
                    }`}>
                      {lineItem.checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs leading-snug break-words flex-1 transition-all ${
                      lineItem.checked ? 'line-through text-zinc-500' : 'text-zinc-200'
                    }`}>
                      {lineItem.text}
                    </span>
                  </div>
                );
              }

              // Normal text line
              if (!lineItem.text.trim()) {
                return <div key={idx} className="h-1" />;
              }

              return (
                <p key={idx} className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed break-words">
                  {lineItem.text}
                </p>
              );
            })}

            {parsedLines.length > 7 && (
              <p className="text-[10px] text-zinc-500 italic pt-1">
                + {parsedLines.length - 7} baris lainnya...
              </p>
            )}
          </div>
        )}

        {/* Tags Chips */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFilterByTag) onFilterByTag(tag);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/30 border border-white/10 text-zinc-300 hover:bg-black/50 hover:text-white transition-colors"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRemoveTag) onRemoveTag(note.id, tag);
                  }}
                  title="Hapus tag"
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Toolbar (Visible on touch & desktop hover) */}
      <div 
        className="pt-2 mt-auto border-t border-white/5 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5">
          {/* Palette Button with Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorMenu(!showColorMenu);
                setShowTagMenu(false);
              }}
              title="Ganti Warna"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Palette className="h-3.5 w-3.5" />
            </button>

            {/* Quick Color Popover */}
            {showColorMenu && (
              <div 
                className="absolute left-0 bottom-8 z-30 p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-2xl flex items-center gap-1.5 flex-wrap w-44 backdrop-blur-md animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onUpdateColor(note.id, c.id);
                      setShowColorMenu(false);
                    }}
                    title={c.name}
                    className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${
                      note.color === c.id ? 'ring-2 ring-white scale-105' : ''
                    }`}
                    style={{ 
                      backgroundColor: c.dotColor,
                      borderColor: note.color === c.id ? '#fff' : 'rgba(255,255,255,0.2)' 
                    }}
                  >
                    {note.color === c.id && <Check className="h-2.5 w-2.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag Button with Mini Input */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTagMenu(!showTagMenu);
                setShowColorMenu(false);
              }}
              title="Tambah Tag"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <TagIcon className="h-3.5 w-3.5" />
            </button>

            {showTagMenu && (
              <form
                onSubmit={handleTagSubmit}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 bottom-8 z-30 p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-2xl flex items-center gap-1 backdrop-blur-md animate-fadeIn"
              >
                <input
                  type="text"
                  placeholder="tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  autoFocus
                  className="w-20 px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-600 text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
                >
                  <Check className="h-3 w-3" />
                </button>
              </form>
            )}
          </div>

          {/* Copy Text Button */}
          <button
            type="button"
            onClick={handleCopyText}
            title={copied ? 'Tersalin!' : 'Salin Teks'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Hapus catatan ini?')) {
                onDelete(note.id);
              }
            }}
            title="Hapus Catatan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Drag handle */}
        <div 
          title="Tahan & geser untuk mengubah urutan"
          className="p-1 text-zinc-500 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
