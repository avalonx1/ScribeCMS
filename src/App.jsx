import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/Dashboard/StatsOverview';
import PostList from './components/Dashboard/PostList';
import CourseSeries from './components/Dashboard/CourseSeries';
import MarkdownEditor from './components/Editor/MarkdownEditor';
import PostDetail from './components/Reader/PostDetail';
import { storageService } from './services/storageService';

export default function App() {
  // Navigation & View States: 'dashboard' | 'editor' | 'reader' | 'courses'
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Data States
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('checking');
  const [storageMode, setStorageMode] = useState('checking');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch all initial data via Dual-Mode Storage Service
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Connection check
      const conn = await storageService.checkConnection();
      setDbStatus(conn.status === 'connected' ? 'online' : 'offline');
      setStorageMode(conn.mode);

      // 2. Fetch categories
      const catData = await storageService.getCategories();
      setCategories(catData);

      // 3. Fetch courses
      const courseData = await storageService.getCourses();
      setCourses(courseData);

      // 4. Fetch stats
      const statsData = await storageService.getStats();
      setStats(statsData);

      // 5. Fetch posts
      const postsData = await storageService.getPosts({
        search: searchTerm,
        category: selectedCategory,
        course: selectedCourseFilter,
        favorite: selectedCategory === 'Favorites'
      });
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory, selectedCourseFilter]);

  // Handle Save / Create / Update Post
  const handleSavePost = async (postData) => {
    try {
      const saved = await storageService.savePost(postData);
      if (saved) {
        showToast(
          postData.id
            ? `Catatan berhasil diperbarui! (${storageMode === 'postgres' ? 'PostgreSQL' : 'Browser Storage'})`
            : `Catatan materi baru berhasil disimpan! (${storageMode === 'postgres' ? 'PostgreSQL' : 'Browser Storage'})`
        );
        await fetchData();
        setSelectedPost(saved);
        setActiveView('reader');
      } else {
        alert('Gagal menyimpan catatan');
      }
    } catch (err) {
      alert('Error saat menyimpan: ' + err.message);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (id) => {
    try {
      const success = await storageService.deletePost(id);
      if (success) {
        showToast('Catatan berhasil dihapus');
        if (selectedPost?.id === id) {
          setSelectedPost(null);
          setActiveView('dashboard');
        }
        await fetchData();
      }
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = async (id) => {
    try {
      const updated = await storageService.toggleFavorite(id);
      if (updated) {
        setPosts(posts.map(p => p.id === id ? updated : p));
        if (selectedPost?.id === id) {
          setSelectedPost(updated);
        }
        const updatedStats = await storageService.getStats();
        setStats(updatedStats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Export all data to JSON
  const handleExportAll = () => {
    const backup = storageService.exportData();
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scribecms_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup seluruh data berhasil diunduh!');
  };

  // Handle Import data from JSON
  const handleImportData = async (jsonData) => {
    try {
      storageService.importData(jsonData);
      showToast('Data berhasil di-import ke Browser Storage!');
      await fetchData();
    } catch (err) {
      alert('Gagal import: ' + err.message);
    }
  };

  // Handle New Post Trigger
  const handleNewPost = () => {
    setEditingPost(null);
    setActiveView('editor');
  };

  // Handle Edit Post Trigger
  const handleEditPost = (post) => {
    setEditingPost(post);
    setActiveView('editor');
  };

  // Handle View Post Details
  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setActiveView('reader');
  };

  // Handle Select Course from Series Page
  const handleSelectCourse = (courseTitle) => {
    setSelectedCourseFilter(courseTitle);
    setSelectedCategory('All');
    setActiveView('dashboard');
  };

  // Handle Update Series (name, description, cover_image)
  const handleUpdateSeries = async (seriesData) => {
    try {
      const res = await storageService.updateSeries(seriesData);
      showToast(res.message || 'Series berhasil diperbarui');
      await fetchData();
      return true;
    } catch (err) {
      alert('Error: ' + err.message);
      return false;
    }
  };

  // Handle Rename Series (for backwards compatibility)
  const handleRenameSeries = async (oldName, newName) => {
    return handleUpdateSeries({ oldName, newName });
  };

  // Handle New Post inside specific Series
  const handleNewPostInSeries = (courseTitle) => {
    setEditingPost({
      course_name: courseTitle,
      category: 'Course Notes'
    });
    setActiveView('editor');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-zinc-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-white ml-1">✕</button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onNewPost={handleNewPost}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dbStatus={dbStatus}
        storageMode={storageMode}
        onExportAll={handleExportAll}
        onImportData={handleImportData}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Only visible on dashboard and courses views) */}
        {(activeView === 'dashboard' || activeView === 'courses') && (
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedCourseFilter('');
            }}
            categories={categories}
            stats={stats}
          />
        )}

        {/* Dynamic Main Viewport */}
        <main className="flex-1 overflow-y-auto">
          
          {/* 1. Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="p-8 max-w-7xl mx-auto">
              
              {/* Course filter badge if active */}
              {selectedCourseFilter && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-semibold">Filter Seri Course:</span>
                    <span className="text-sm font-bold text-white">{selectedCourseFilter}</span>
                  </div>
                  <button
                    onClick={() => setSelectedCourseFilter('')}
                    className="text-xs text-emerald-400 hover:text-white px-2.5 py-1 rounded-lg bg-emerald-900/40 border border-emerald-500/20"
                  >
                    Hapus Filter
                  </button>
                </div>
              )}

              {/* Stats metric cards */}
              {!searchTerm && !selectedCourseFilter && selectedCategory === 'All' && (
                <StatsOverview stats={stats} posts={posts} />
              )}

              {/* Post List */}
              <PostList
                posts={posts}
                loading={loading}
                onSelectPost={handleSelectPost}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onToggleFavorite={handleToggleFavorite}
                onNewPost={handleNewPost}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
              />
            </div>
          )}

          {/* 2. Course Series View */}
          {activeView === 'courses' && (
            <div className="p-8 max-w-7xl mx-auto">
              <CourseSeries
                courses={courses}
                onSelectCourse={handleSelectCourse}
                onSelectPost={handleSelectPost}
                onEditPost={handleEditPost}
                onNewPost={handleNewPost}
                onNewPostInSeries={handleNewPostInSeries}
                onRenameSeries={handleRenameSeries}
                onUpdateSeries={handleUpdateSeries}
              />
            </div>
          )}

          {/* 3. Editor View */}
          {activeView === 'editor' && (
            <MarkdownEditor
              initialPost={editingPost}
              categories={categories}
              courses={courses}
              onSave={handleSavePost}
              onCancel={() => {
                if (selectedPost) setActiveView('reader');
                else setActiveView('dashboard');
              }}
              showToast={showToast}
            />
          )}

          {/* 4. Reader View */}
          {activeView === 'reader' && selectedPost && (
            <PostDetail
              post={selectedPost}
              onBack={() => setActiveView('dashboard')}
              onEdit={handleEditPost}
              onToggleFavorite={handleToggleFavorite}
              showToast={showToast}
            />
          )}

        </main>

      </div>

    </div>
  );
}
