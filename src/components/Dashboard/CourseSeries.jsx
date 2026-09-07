import React, { useState } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  Calendar, 
  Edit3, 
  Plus, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Check, 
  X, 
  Clock, 
  FolderKanban,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Wand2
} from 'lucide-react';
import { CURATED_COVER_PRESETS, getPostFeatureImage } from '../../utils/imageHelper';

export default function CourseSeries({ 
  courses = [], 
  onSelectCourse, 
  onSelectPost, 
  onEditPost, 
  onNewPost, 
  onNewPostInSeries,
  onRenameSeries,
  onUpdateSeries 
}) {
  // Track which series are expanded to show child notes (default all expanded)
  const [expandedSeries, setExpandedSeries] = useState(() => {
    const init = {};
    courses.forEach(c => { init[c.course_name] = true; });
    return init;
  });

  // Edit Series Modal State (Name, Description, Feature Image)
  const [editingSeries, setEditingSeries] = useState(null); // course object
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // New Series quick modal state
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeriesDesc, setNewSeriesDesc] = useState('');
  const [newSeriesCover, setNewSeriesCover] = useState('');

  const toggleExpand = (courseName) => {
    setExpandedSeries(prev => ({
      ...prev,
      [courseName]: !prev[courseName]
    }));
  };

  const handleOpenEdit = (e, course) => {
    e.stopPropagation();
    setEditingSeries(course);
    setEditName(course.course_name);
    setEditDesc(course.description || '');
    setEditCover(course.cover_image || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingSeries) return;

    setSavingEdit(true);
    try {
      const updateFn = onUpdateSeries || onRenameSeries;
      const ok = await updateFn({
        oldName: editingSeries.course_name,
        newName: editName.trim(),
        description: editDesc.trim(),
        cover_image: editCover.trim() || null
      });
      if (ok) {
        setEditingSeries(null);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // Upload file for cover image
  const handleUploadCover = async (e, isNew = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        if (isNew) {
          setNewSeriesCover(data.url);
        } else {
          setEditCover(data.url);
        }
      }
    } catch (err) {
      alert('Gagal mengunggah gambar: ' + err.message);
    }
  };

  // Auto-detect cover from child notes
  const handleAutoDetectCover = () => {
    const noteWithCover = editingSeries?.notes?.find(n => n.cover_image && n.cover_image.trim() !== '');
    if (noteWithCover) {
      setEditCover(noteWithCover.cover_image);
    } else {
      alert('Tidak ada gambar cover pada catatan anak di series ini.');
    }
  };

  const handleCreateNewSeriesSubmit = async (e) => {
    e.preventDefault();
    if (!newSeriesName.trim()) return;
    
    // If update/create API available, save series metadata first
    if (onUpdateSeries) {
      await onUpdateSeries({
        oldName: null,
        newName: newSeriesName.trim(),
        description: newSeriesDesc.trim(),
        cover_image: newSeriesCover.trim() || null
      });
    }

    setIsCreatingNewSeries(false);
    onNewPostInSeries(newSeriesName.trim());
    setNewSeriesName('');
    setNewSeriesDesc('');
    setNewSeriesCover('');
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/20 max-w-xl mx-auto my-8">
        <div className="h-12 w-12 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Belum ada seri course</h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Kumpulkan catatan dan modul belajar Anda ke dalam struktur berseri (*parent course & child notes*).
        </p>
        <button
          onClick={onNewPost}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Buat Series Pertama</span>
        </button>
      </div>
    );
  }

  const totalAllNotes = courses.reduce((acc, c) => acc + parseInt(c.total_modules || (c.notes ? c.notes.length : 0), 10), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header with stats & create new series */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Parent-Child Hierarchy
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {courses.length} Series · {totalAllNotes} Catatan Anak
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Course & Series Hub</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Setiap <strong>Parent Series</strong> memiliki feature image, deskripsi, dan daftar <strong>Child Notes</strong>. Anda dapat mengedit nama, deskripsi, dan gambar cover series kapan saja.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNewSeries(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Buat Series Baru</span>
        </button>
      </div>

      {/* Series Cards Container */}
      <div className="space-y-8">
        {courses.map((course, idx) => {
          const notes = course.notes || [];
          const childCount = parseInt(course.total_modules || notes.length, 10);
          const isExpanded = expandedSeries[course.course_name] ?? true;
          
          // Cover image for the parent series: explicit course cover -> first note cover -> preset
          const firstNoteCover = notes.find(n => n.cover_image)?.cover_image;
          const seriesCoverImg = course.cover_image || firstNoteCover || CURATED_COVER_PRESETS[idx % CURATED_COVER_PRESETS.length].url;

          const lastUpdated = new Date(course.last_updated).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div 
              key={idx}
              className="editorial-card rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl transition-all"
            >
              {/* 1. PARENT SERIES HEADER */}
              <div className="p-5 sm:p-6 bg-zinc-900/60 border-b border-zinc-800/80">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left: Cover thumbnail & Series Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative h-20 w-32 sm:h-24 sm:w-36 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 shadow-md">
                      <img 
                        src={seriesCoverImg} 
                        alt={course.course_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Parent Label & Child Count Pill */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
                          Parent Series
                        </span>
                        
                        {/* Prominent Child Count Pill */}
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          <span>{childCount} Catatan Child</span>
                        </span>
                      </div>

                      {/* Series Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug truncate">
                        {course.course_name}
                      </h3>

                      {/* Series Description */}
                      {course.description ? (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 italic mt-1">
                          Belum ada deskripsi. Klik 'Edit Series' untuk menambahkan.
                        </p>
                      )}

                      <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>Pembaruan terakhir: {lastUpdated}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions for Parent Series */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
                    
                    {/* Edit Series (Name, Desc, Feature Image) Button */}
                    <button
                      onClick={(e) => handleOpenEdit(e, course)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/70 transition-colors"
                      title="Edit Nama, Deskripsi & Feature Image Series ini"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Edit Series</span>
                    </button>

                    {/* Add Child Note to this Series */}
                    <button
                      onClick={() => onNewPostInSeries(course.course_name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
                      title="Tambah Catatan Anak ke Series Ini"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>+ Tambah Catatan</span>
                    </button>

                    {/* Toggle Child Notes Expand */}
                    <button
                      onClick={() => toggleExpand(course.course_name)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title={isExpanded ? 'Tutup Daftar Catatan' : 'Buka Daftar Catatan'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                  </div>

                </div>
              </div>

              {/* 2. CHILD NOTES SECTION (Visual Tree & Hierarchy) */}
              {isExpanded && (
                <div className="p-5 sm:p-7 bg-[#0b0f19]/80">
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderKanban className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Isi Modul & Catatan Anak ({childCount} Catatan):</span>
                    </span>

                    <button
                      onClick={() => onSelectCourse(course.course_name)}
                      className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      <span>Filter di Dashboard</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Child Notes Tree */}
                  {notes.length > 0 ? (
                    <div className="relative border-l-2 border-emerald-500/25 ml-4 sm:ml-6 pl-5 sm:pl-7 space-y-3.5 py-1">
                      {notes.map((note, noteIdx) => {
                        const noteDate = new Date(note.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <div
                            key={note.id || noteIdx}
                            className="group/note relative p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                          >
                            {/* Branch connector line from left parent tree */}
                            <span className="absolute -left-[29px] sm:-left-[37px] top-1/2 -translate-y-1/2 w-4 sm:w-6 h-px bg-emerald-500/30" />
                            <span className="absolute -left-[32px] sm:-left-[40px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />

                            {/* Note Information */}
                            <div 
                              onClick={() => onSelectPost && onSelectPost(note)}
                              className="cursor-pointer min-w-0 flex-1"
                            >
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {/* Child Order Badge */}
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                                  #{noteIdx + 1}
                                </span>

                                {note.module_name && (
                                  <span className="text-xs font-medium text-zinc-400 truncate max-w-xs">
                                    Modul: {note.module_name}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-semibold text-white group-hover/note:text-emerald-400 transition-colors truncate">
                                {note.title}
                              </h4>

                              {note.summary && (
                                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                                  {note.summary}
                                </p>
                              )}
                            </div>

                            {/* Meta & Actions on Child Note */}
                            <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-zinc-600" />
                                {note.reading_time || 1} mnt
                              </span>
                              <span className="hidden md:inline">
                                {noteDate}
                              </span>

                              <div className="flex items-center gap-1.5 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEditPost) onEditPost(note);
                                  }}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                  title="Edit Catatan ini"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectPost) onSelectPost(note);
                                  }}
                                  className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors"
                                  title="Buka Catatan"
                                >
                                  <span>Baca</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })}

                      {/* Add new child note inline at the end of tree */}
                      <button
                        onClick={() => onNewPostInSeries(course.course_name)}
                        className="w-full relative flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-800 hover:border-emerald-500/40 bg-zinc-900/20 hover:bg-zinc-900/60 text-xs font-medium text-zinc-400 hover:text-emerald-300 transition-all group"
                      >
                        <span className="absolute -left-[29px] sm:-left-[37px] top-1/2 -translate-y-1/2 w-4 sm:w-6 h-px bg-emerald-500/30" />
                        <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>+ Tambah Catatan / Modul Baru ke "{course.course_name}"</span>
                      </button>

                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500">
                      Belum ada catatan anak di series ini.{' '}
                      <button
                        onClick={() => onNewPostInSeries(course.course_name)}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        Tambah sekarang
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 3. MODAL: EDIT SERIES (NAME, DESCRIPTION, FEATURE IMAGE) */}
      {editingSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setEditingSeries(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Edit Series (Parent)</h3>
                <p className="text-xs text-zinc-400">Sesuaikan nama, deskripsi, dan feature image cover</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* 1. Nama Series */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nama Series <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ketikkan nama series..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 2. Deskripsi Series */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Deskripsi Series
                </label>
                <textarea
                  rows="3"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Tulis ringkasan mengenai topik atau kurikulum series ini..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* 3. Feature Image (Cover) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Feature Image Series</span>
                  </label>
                  {editCover && (
                    <button
                      type="button"
                      onClick={() => setEditCover('')}
                      className="text-[11px] text-zinc-500 hover:text-rose-400"
                    >
                      Hapus Cover
                    </button>
                  )}
                </div>

                {/* Preview */}
                {editCover ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-2">
                    <img src={editCover} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-center mb-2">
                    <p className="text-zinc-500 text-[11px]">Belum ada gambar cover khusus.</p>
                  </div>
                )}

                {/* URL input */}
                <input
                  type="text"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  placeholder="Paste URL gambar (https://...)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 mb-2"
                />

                {/* Upload & Auto-detect actions */}
                <div className="flex items-center gap-2 mb-2.5">
                  <label className="flex-1 text-center py-1.5 px-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer transition-colors text-xs font-medium">
                    <Upload className="h-3 w-3 inline mr-1 text-zinc-400" />
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadCover(e, false)} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleAutoDetectCover}
                    className="py-1.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors text-xs font-medium"
                    title="Ambil gambar dari catatan anak"
                  >
                    <Wand2 className="h-3 w-3 inline mr-1 text-emerald-400" />
                    <span>Dari Catatan Anak</span>
                  </button>
                </div>

                {/* Presets Chips */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                    Preset Cepat:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CURATED_COVER_PRESETS.slice(0, 6).map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setEditCover(p.url)}
                        className="p-1 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-left transition-colors flex items-center gap-1.5"
                      >
                        <img src={p.url} alt="" className="h-4 w-4 rounded object-cover shrink-0" />
                        <span className="text-[10px] text-zinc-400 truncate">{p.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                💡 <strong>Catatan:</strong> Jika Anda mengubah nama series, seluruh <strong>{editingSeries.total_modules || editingSeries.notes?.length || 0} catatan anak</strong> di dalamnya akan otomatis disinkronisasi ke nama baru.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSeries(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: BUAT SERIES BARU (WITH OPTIONAL DESC & COVER) */}
      {isCreatingNewSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsCreatingNewSeries(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Buat Series Pembelajaran Baru</h3>
                <p className="text-xs text-zinc-400">Tentukan nama, deskripsi, dan cover series</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewSeriesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nama Series <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={newSeriesName}
                  onChange={(e) => setNewSeriesName(e.target.value)}
                  placeholder="Misal: Arsitektur Microservices 2026..."
                  required
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Deskripsi Series (Opsional)
                </label>
                <textarea
                  rows="2"
                  value={newSeriesDesc}
                  onChange={(e) => setNewSeriesDesc(e.target.value)}
                  placeholder="Deskripsi singkat kurikulum series..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Feature Image Series (Opsional)
                </label>
                <input
                  type="text"
                  value={newSeriesCover}
                  onChange={(e) => setNewSeriesCover(e.target.value)}
                  placeholder="Paste URL gambar cover atau pilih preset..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 mb-1.5"
                />
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {CURATED_COVER_PRESETS.slice(0, 4).map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setNewSeriesCover(p.url)}
                      className="px-2 py-1 rounded border border-zinc-800 bg-zinc-950 text-[10px] text-zinc-400 hover:text-white shrink-0"
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                Setelah series dibuat, Anda akan langsung diarahkan ke editor untuk menulis atau mem-paste materi modul pertama.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewSeries(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Mulai Tulis Modul</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
