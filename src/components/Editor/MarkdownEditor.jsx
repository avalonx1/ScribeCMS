import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { 
  Save, 
  Eye, 
  Columns, 
  Edit3, 
  Video, 
  Image as ImageIcon, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Heading3, 
  Table, 
  Sparkles, 
  GraduationCap, 
  Tag, 
  ArrowLeft,
  Upload,
  X,
  Wand2
} from 'lucide-react';
import { convertCourseClipboardData } from '../../utils/htmlToMarkdown';
import { CURATED_COVER_PRESETS, extractFirstImageFromMarkdown } from '../../utils/imageHelper';
import VideoModal from './VideoModal';
import { storageService } from '../../services/storageService';

export default function MarkdownEditor({ 
  initialPost = null, 
  categories = [], 
  courses = [],
  onSave, 
  onCancel,
  showToast 
}) {
  const isEditing = Boolean(initialPost?.id);

  // Form State
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [category, setCategory] = useState(initialPost?.category || 'Course Notes');
  const [courseName, setCourseName] = useState(initialPost?.course_name || '');
  const [moduleName, setModuleName] = useState(initialPost?.module_name || '');
  const [sourceUrl, setSourceUrl] = useState(initialPost?.source_url || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialPost?.tags || []);
  const [status, setStatus] = useState(initialPost?.status || 'published');
  const [isFavorite, setIsFavorite] = useState(initialPost?.is_favorite || false);
  const [saving, setSaving] = useState(false);

  // Series selection mode: dropdown vs new
  const hasExistingCourses = courses && courses.length > 0;
  const isExistingCourse = courses.some(c => c.course_name === initialPost?.course_name);
  const [isNewSeries, setIsNewSeries] = useState(
    initialPost?.course_name ? !isExistingCourse : false
  );

  // Editor View Layout: 'split' | 'edit' | 'preview'
  const [viewLayout, setViewLayout] = useState('split');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [pasteBanner, setPasteBanner] = useState(null);

  const textareaRef = useRef(null);
  const readingTime = Math.max(1, Math.ceil((content.trim().split(/\s+/).length || 1) / 200));

  // Handle Smart Rich Paste from Course Websites
  const handlePaste = (e) => {
    const html = e.clipboardData.getData('text/html');
    if (!html) return;

    e.preventDefault();
    const result = convertCourseClipboardData(e.clipboardData);

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText = currentText.substring(0, start) + result.markdown + currentText.substring(end);
    setContent(newText);

    // Auto set cover image if currently empty and image was pasted
    if (!coverImage) {
      const extracted = extractFirstImageFromMarkdown(result.markdown);
      if (extracted) {
        setCoverImage(extracted);
      }
    }

    setPasteBanner({
      images: result.stats.images,
      videos: result.stats.videos,
      links: result.stats.links
    });

    setTimeout(() => setPasteBanner(null), 6000);
    if (showToast) {
      showToast(`✨ Smart Paste: ${result.stats.videos} video, ${result.stats.images} gambar & link berhasil dikonversi!`);
    }
  };

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = before + selected + after;
    const updated = text.substring(0, start) + replacement + text.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t) => setTags(tags.filter(tag => tag !== t));

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Judul dan konten wajib diisi');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: initialPost?.id,
        title,
        content,
        cover_image: coverImage || null,
        category,
        course_name: courseName,
        module_name: moduleName,
        source_url: sourceUrl,
        tags,
        status,
        is_favorite: isFavorite
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload image via Dual-Mode storageService
  const handleImageUpload = async (e, forCover = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await storageService.uploadImage(file);
      if (data?.url) {
        if (forCover) {
          setCoverImage(data.url);
          if (showToast) showToast('Feature image berhasil di-upload!');
        } else {
          insertText(`\n![${data.fileName || 'Image'}](${data.url})\n`);
          if (showToast) showToast('Gambar berhasil disematkan!');
        }
      }
    } catch (err) {
      alert('Gagal upload gambar: ' + err.message);
    }
  };

  const handleAutoDetectCover = () => {
    const extracted = extractFirstImageFromMarkdown(content);
    if (extracted) {
      setCoverImage(extracted);
      if (showToast) showToast('Feature image diambil dari gambar dalam materi!');
    } else {
      alert('Tidak ditemukan gambar dalam isi artikel markdown.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#0b0f19]">
      
      {/* Top Bar */}
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-zinc-300">
            {isEditing ? 'Edit Catatan' : 'Tulis Catatan / Modul Baru'}
          </span>
        </div>

        {/* Layout toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setViewLayout('edit')}
            className={`px-3 py-1 rounded-md transition-colors ${viewLayout === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setViewLayout('split')}
            className={`px-3 py-1 rounded-md transition-colors ${viewLayout === 'split' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Split
          </button>
          <button
            onClick={() => setViewLayout('preview')}
            className={`px-3 py-1 rounded-md transition-colors ${viewLayout === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Preview
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleFormSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
        </button>
      </div>

      {/* Smart Paste Banner */}
      {pasteBanner && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-2 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              Smart Course Paste: {pasteBanner.videos} video, {pasteBanner.images} gambar, {pasteBanner.links} link dipertahankan.
            </span>
          </div>
          <button onClick={() => setPasteBanner(null)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor & Preview Column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Title Input */}
          <div className="p-6 pb-2 border-b border-zinc-800/60 bg-[#0b0f19] shrink-0">
            <input
              type="text"
              placeholder="Judul Materi atau Catatan Jurnal..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none tracking-tight"
            />
          </div>

          {/* Minimal Toolbar */}
          <div className="px-6 py-2 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center gap-1 overflow-x-auto text-zinc-400 text-xs shrink-0">
            <button onClick={() => insertText('# ', '')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="H1">
              <Heading1 className="h-4 w-4" />
            </button>
            <button onClick={() => insertText('## ', '')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="H2">
              <Heading2 className="h-4 w-4" />
            </button>
            <button onClick={() => insertText('### ', '')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="H3">
              <Heading3 className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <button onClick={() => insertText('**', '**')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white font-bold" title="Bold">
              B
            </button>
            <button onClick={() => insertText('*', '*')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white italic" title="Italic">
              I
            </button>
            <button onClick={() => insertText('> 💡 **Catatan Kursus:**\n> ', '')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="Callout">
              <Quote className="h-4 w-4" />
            </button>
            <button onClick={() => insertText('- ', '')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="List">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => insertText('1. ', '')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </button>
            <button onClick={() => insertText('```javascript\n', '\n```')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="Code">
              <Code className="h-4 w-4" />
            </button>
            <button onClick={() => insertText('\n| Kolom 1 | Kolom 2 |\n|---|---|\n| Nilai 1 | Nilai 2 |\n')} className="p-1.5 rounded hover:bg-zinc-800 hover:text-white" title="Tabel">
              <Table className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
            >
              <Video className="h-3.5 w-3.5 text-emerald-400" />
              <span>Embed Video</span>
            </button>
            <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5 text-zinc-400" />
              <span>Sisipkan Gambar</span>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
            </label>
          </div>

          {/* Viewports */}
          <div className="flex-1 flex overflow-hidden">
            {(viewLayout === 'edit' || viewLayout === 'split') && (
              <div className={`h-full flex flex-col ${viewLayout === 'split' ? 'w-1/2 border-r border-zinc-800/80' : 'w-full'}`}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Ketik catatan Markdown di sini atau PASTE materi course dari website..."
                  className="w-full h-full p-6 bg-[#0b0f19] font-mono text-sm leading-relaxed text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none"
                />
              </div>
            )}

            {(viewLayout === 'preview' || viewLayout === 'split') && (
              <div className={`h-full overflow-y-auto p-8 bg-zinc-950/40 ${viewLayout === 'split' ? 'w-1/2' : 'w-full'}`}>
                <div className="max-w-3xl mx-auto">
                  {coverImage && (
                    <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-zinc-900 border border-zinc-800">
                      <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="markdown-body">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    >
                      {content || '*Preview Markdown akan muncul di sini...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Settings Sidebar */}
        <div className="w-80 border-l border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto shrink-0 space-y-6 text-xs">
          
          {/* FEATURE IMAGE (COVER) MANAGEMENT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feature Image (Cover)</span>
              </label>
              {coverImage && (
                <button
                  onClick={() => setCoverImage('')}
                  className="text-zinc-500 hover:text-rose-400 text-[11px]"
                >
                  Hapus
                </button>
              )}
            </div>

            {/* Cover Preview */}
            {coverImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-2.5">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center mb-2.5">
                <p className="text-zinc-500 text-[11px]">Belum ada gambar cover khusus.</p>
              </div>
            )}

            {/* Input URL */}
            <input
              type="text"
              placeholder="Paste URL gambar (Unsplash / web)..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 mb-2"
            />

            {/* Actions: Upload & Auto Detect */}
            <div className="flex items-center gap-2 mb-3">
              <label className="flex-1 text-center py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer transition-colors font-medium">
                <Upload className="h-3 w-3 inline mr-1" />
                <span>Upload File</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleAutoDetectCover}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors font-medium"
                title="Ambil gambar dari dalam isi materi Markdown"
              >
                <Wand2 className="h-3 w-3 inline mr-1 text-emerald-400" />
                <span>Dari Isi</span>
              </button>
            </div>

            {/* Presets Chips */}
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">
                Pilihan Cover Cepat:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CURATED_COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(preset.url)}
                    className="p-1 rounded-lg border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800 text-left transition-colors flex items-center gap-1.5"
                  >
                    <img src={preset.url} alt="" className="h-5 w-5 rounded object-cover shrink-0" />
                    <span className="text-[10px] text-zinc-400 truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800/70" />

          {/* Kategori */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
              <option value="Course Notes">Course Notes</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Daily Journal">Daily Journal</option>
              <option value="Tech Insights">Tech Insights</option>
            </select>
          </div>

          {/* Course / Series Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Nama Series / Course</span>
              </label>
              {hasExistingCourses && (
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isNewSeries;
                    setIsNewSeries(nextMode);
                    if (nextMode) {
                      setCourseName('');
                    }
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  {isNewSeries ? '← Pilih yang Ada' : '+ Series Baru'}
                </button>
              )}
            </div>

            {hasExistingCourses && !isNewSeries ? (
              <select
                value={courseName}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsNewSeries(true);
                    setCourseName('');
                  } else {
                    setCourseName(e.target.value);
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
              >
                <option value="">-- Tanpa Series (Catatan Mandiri) --</option>
                {courses.map((c, idx) => (
                  <option key={idx} value={c.course_name}>
                    📁 {c.course_name} ({c.total_modules || (c.notes ? c.notes.length : 0)} notes)
                  </option>
                ))}
                <option value="__NEW__">➕ + Tulis Series Baru...</option>
              </select>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Tuliskan nama series baru..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                />
                {hasExistingCourses && (
                  <p className="text-[10px] text-zinc-500">
                    Series ini akan otomatis tersimpan ke dropdown untuk catatan berikutnya.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Module Name */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Nama Bab / Modul</label>
            <input
              type="text"
              list="existing-modules-list"
              placeholder="Contoh: Bab 3 - Database PostgreSQL"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
            {courses.find(c => c.course_name === courseName)?.modules && (
              <datalist id="existing-modules-list">
                {courses.find(c => c.course_name === courseName).modules.map((m, mIdx) => (
                  <option key={mIdx} value={m} />
                ))}
              </datalist>
            )}
          </div>

          {/* Source Course URL */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">URL Sumber Course</label>
            <input
              type="url"
              placeholder="https://..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Tags (Tekan Enter)</label>
            <input
              type="text"
              placeholder="Ketik tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 mb-2"
            />
            <div className="flex flex-wrap gap-1">
              {tags.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                  #{t}
                  <button onClick={() => handleRemoveTag(t)} className="text-zinc-500 hover:text-white">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Reading Time */}
          <div className="pt-2 text-zinc-500 text-[11px] flex justify-between">
            <span>Perkiraan Waktu Baca:</span>
            <span className="font-semibold text-zinc-300">{readingTime} Menit</span>
          </div>

        </div>

      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onInsertVideo={(snippet) => insertText(snippet)}
      />

    </div>
  );
}
