import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/Dashboard/StatsOverview';
import PostList from './components/Dashboard/PostList';
import CourseSeries from './components/Dashboard/CourseSeries';
import MarkdownEditor from './components/Editor/MarkdownEditor';
import PostDetail from './components/Reader/PostDetail';

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

  // Fetch all initial data from PostgreSQL Backend
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Health check
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setDbStatus(healthData.status);
        }
      } catch {
        setDbStatus('offline');
      }

      // 2. Fetch categories
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // 3. Fetch courses
      const courseRes = await fetch('/api/courses');
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData);
      }

      // 4. Fetch stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 5. Fetch posts
      let postUrl = '/api/posts?';
      if (searchTerm) postUrl += `search=${encodeURIComponent(searchTerm)}&`;
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'Favorites') {
        postUrl += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (selectedCategory === 'Favorites') {
        postUrl += `favorite=true&`;
      }
      if (selectedCourseFilter) {
        postUrl += `course=${encodeURIComponent(selectedCourseFilter)}&`;
      }

      const postsRes = await fetch(postUrl);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory, selectedCourseFilter]);

  // Handle Save / Create / Update Post in PostgreSQL
  const handleSavePost = async (postData) => {
    try {
      let res;
      if (postData.id) {
        // Update
        res = await fetch(`/api/posts/${postData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
      } else {
        // Create
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
      }

      if (res.ok) {
        const saved = await res.json();
        showToast(postData.id ? 'Catatan berhasil diperbarui di PostgreSQL!' : 'Catatan materi baru berhasil disimpan!');
        await fetchData();
        setSelectedPost(saved);
        setActiveView('reader');
      } else {
        const errData = await res.json();
        alert('Gagal menyimpan: ' + (errData.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      alert('Error koneksi database: ' + err.message);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Catatan berhasil dihapus dari PostgreSQL');
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
      const res = await fetch(`/api/posts/${id}/favorite`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setPosts(posts.map(p => p.id === id ? updated : p));
        if (selectedPost?.id === id) {
          setSelectedPost(updated);
        }
        // Refresh stats
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Export all posts to JSON
  const handleExportAll = () => {
    const dataStr = JSON.stringify(posts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app_blog_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup seluruh database berhasil diunduh!');
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
      const res = await fetch('/api/courses/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesData)
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Series berhasil diperbarui');
        await fetchData();
        return true;
      } else {
        const err = await res.json();
        alert('Gagal memperbarui series: ' + (err.error || 'Terjadi kesalahan'));
        return false;
      }
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
        onExportAll={handleExportAll}
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
