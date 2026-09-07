// Storage Service with Dual-Mode Architecture:
// 1. PostgreSQL Mode: Connected to local Express backend (/api/...)
// 2. Browser Storage Mode (Offline / GitHub Pages Demo): Powered by LocalStorage with rich seed data

const STORAGE_KEYS = {
  POSTS: 'scribecms_posts',
  CATEGORIES: 'scribecms_categories',
  SERIES: 'scribecms_series'
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Course Notes', description: 'Catatan materi kursus & tutorial online dengan video/gambar', icon: 'GraduationCap', color: '#14b8a6' },
  { id: 2, name: 'Daily Journal', description: 'Catatan harian, refleksi, dan ide', icon: 'BookOpen', color: '#10b981' },
  { id: 3, name: 'Tech & Dev', description: 'Snippet kode, arsitektur, dan referensi pemrograman', icon: 'Code2', color: '#f59e0b' },
  { id: 4, name: 'Webinar & Videos', description: 'Rangkuman video materi kursus dan webinar', icon: 'Video', color: '#ec4899' }
];

const DEFAULT_SERIES = [
  {
    name: 'Modern Web Engineering',
    description: 'Arsitektur React 19, Next.js, dan optimasi performa modern.',
    cover_image: '',
    post_count: 2
  }
];

const DEFAULT_POSTS = [
  {
    id: 1,
    title: 'Mastering Next.js 15 & React 19: Full Course Notes',
    slug: 'mastering-nextjs-15-react-19',
    summary: 'Catatan komprehensif dari course Next.js 15 App Router, Server Actions, dan integrasi video tutorial.',
    category: 'Course Notes',
    course_name: 'Modern Web Engineering',
    module_name: 'Module 1: Server Components & Actions',
    tags: ['React', 'Next.js', 'Tutorial', 'Web Development'],
    reading_time: 4,
    is_favorite: true,
    source_url: 'https://youtube.com',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    content: `# Mastering Next.js 15 & React 19: Full Course Notes

Selamat datang di catatan modul kursus **Next.js 15 & React 19**. Catatan ini merangkum pembahasan konsep inti App Router, Server Components, dan integrasi video tutorial interaktif.

## 📺 Video Tutorial Modul 1
Tonton video pembelajaran resmi di bawah ini:

<iframe width="100%" height="420" src="https://www.youtube.com/embed/Sklc_fQBmcs" title="Next.js 15 Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="rounded-xl my-4 shadow-lg border border-slate-700"></iframe>

---

## 🚀 Key Takeaways dari Course

1. **React Server Components (RSC)**: Komponen di-render secara default di server untuk performa super cepat tanpa beban JS berlebih di client.
2. **Server Actions**: Mutasi data langsung dari form tanpa perlu membuat endpoint API manual.
3. **Partial Prerendering (PPR)**: Gabungan rendering statis dan dinamis dalam satu shell halaman.

### Contoh Code Server Action:
\`\`\`javascript
// app/actions/createPost.js
'use server'

import { pool } from '@/lib/db'

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  const result = await pool.query(
    'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  
  return result.rows[0];
}
\`\`\`

> 💡 **Tip Course**: Gunakan \`useOptimistic\` untuk memberikan feedback instan ke user sebelum response server selesai.

## 🔗 Referensi & Resources
- [Dokumentasi Resmi Next.js](https://nextjs.org/docs)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)`
  },
  {
    id: 2,
    title: 'PostgreSQL Advanced Schema & Indexing Guide',
    slug: 'postgresql-advanced-schema-indexing',
    summary: 'Strategi optimasi query database, B-Tree vs GIN Indexing, serta teknik partitioning untuk aplikasi skala besar.',
    category: 'Tech & Dev',
    course_name: 'Modern Web Engineering',
    module_name: 'Module 2: Database Performance Tuning',
    tags: ['PostgreSQL', 'Database', 'Performance', 'Backend'],
    reading_time: 5,
    is_favorite: false,
    source_url: 'https://postgresql.org',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    content: `# PostgreSQL Advanced Schema & Indexing Guide

Panduan praktis merancang skema database PostgreSQL berkinerja tinggi untuk aplikasi CMS dan knowledge hub.

## 📊 Kapan Menggunakan Berbagai Tipe Index?

| Tipe Index | Kegunaan Utama | Operator Umum |
| :--- | :--- | :--- |
| **B-Tree** | Default, perbandingan nilai pasti & rentang | \`=\`, \`<\`, \`>\`, \`BETWEEN\` |
| **GIN** | Kolom JSONB, Array, Full-Text Search | \`@>\`, \`?\`, \`@@\` |
| **BRIN** | Tabel historis berurutan (Timestamp besar) | Range timestamps |

### Contoh Query Full-Text Search dengan GIN:
\`\`\`sql
-- Membuat index GIN pada konten artikel
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('english', content));

-- Melakukan pencarian cepat
SELECT id, title, ts_rank(to_tsvector('english', content), query) AS rank
FROM posts, to_tsquery('english', 'database & indexing') query
WHERE to_tsvector('english', content) @@ query
ORDER BY rank DESC;
\`\`\`

> ⚡ **Tips:** Selalu jalankan \`EXPLAIN ANALYZE\` sebelum dan sesudah menambahkan index untuk mengukur cost query sebenarnya.`
  }
];

class StorageService {
  constructor() {
    this.mode = 'checking'; // 'postgres' | 'local' | 'checking'
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERIES)) {
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(DEFAULT_SERIES));
    }
  }

  // Detect whether local backend is active
  async checkConnection() {
    // If hosted on GitHub Pages or custom domain without server, prefer local immediately
    if (window.location.hostname.includes('github.io')) {
      this.mode = 'local';
      return { status: 'browser_storage', mode: 'local' };
    }

    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        this.mode = 'postgres';
        return { status: data.status || 'connected', mode: 'postgres' };
      }
    } catch {
      // Offline fallback
    }

    this.mode = 'local';
    return { status: 'browser_storage', mode: 'local' };
  }

  getMode() {
    return this.mode;
  }

  // Categories
  async getCategories() {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend failed, falling back to local categories', e);
      }
    }
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  }

  // Courses / Series
  async getCourses() {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend failed, falling back to local courses', e);
      }
    }

    const posts = await this.getPosts({});
    const seriesMeta = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    
    // Group posts by course_name
    const coursesMap = {};
    posts.forEach(p => {
      if (p.course_name) {
        if (!coursesMap[p.course_name]) {
          const meta = seriesMeta.find(s => s.name === p.course_name) || {};
          coursesMap[p.course_name] = {
            course_name: p.course_name,
            post_count: 0,
            description: meta.description || '',
            cover_image: meta.cover_image || ''
          };
        }
        coursesMap[p.course_name].post_count += 1;
      }
    });

    return Object.values(coursesMap);
  }

  // Stats
  async getStats() {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend failed, falling back to local stats', e);
      }
    }

    const posts = await this.getPosts({});
    const courses = await this.getCourses();

    const totalPosts = posts.length;
    const totalFavorites = posts.filter(p => p.is_favorite).length;
    const totalCourses = courses.length;
    const totalReadingTime = posts.reduce((acc, p) => acc + (parseInt(p.reading_time, 10) || 1), 0);

    return {
      total_posts: totalPosts,
      total_favorites: totalFavorites,
      total_courses: totalCourses,
      total_reading_time: totalReadingTime
    };
  }

  // Posts with search & filter
  async getPosts({ search = '', category = '', course = '', favorite = false }) {
    if (this.mode === 'postgres') {
      try {
        let postUrl = '/api/posts?';
        if (search) postUrl += `search=${encodeURIComponent(search)}&`;
        if (category && category !== 'All' && category !== 'Favorites') {
          postUrl += `category=${encodeURIComponent(category)}&`;
        }
        if (favorite || category === 'Favorites') {
          postUrl += `favorite=true&`;
        }
        if (course) {
          postUrl += `course=${encodeURIComponent(course)}&`;
        }

        const res = await fetch(postUrl);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend failed, falling back to local posts', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts = raw ? JSON.parse(raw) : DEFAULT_POSTS;

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'All' && category !== 'Favorites') {
      posts = posts.filter(p => p.category === category);
    }

    if (favorite || category === 'Favorites') {
      posts = posts.filter(p => p.is_favorite);
    }

    if (course) {
      posts = posts.filter(p => p.course_name === course);
    }

    // Sort by created_at desc
    return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Save (Create or Update) Post
  async savePost(postData) {
    if (this.mode === 'postgres') {
      try {
        let res;
        if (postData.id) {
          res = await fetch(`/api/posts/${postData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          });
        } else {
          res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          });
        }

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend save failed, saving to local storage', e);
      }
    }

    // Local Storage logic
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts = raw ? JSON.parse(raw) : [];

    const now = new Date().toISOString();
    let saved;

    if (postData.id) {
      posts = posts.map(p => {
        if (p.id === postData.id) {
          saved = {
            ...p,
            ...postData,
            updated_at: now
          };
          return saved;
        }
        return p;
      });
    } else {
      const newId = Date.now();
      saved = {
        id: newId,
        slug: (postData.title || 'untitled')
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-') + '-' + newId.toString().slice(-4),
        created_at: now,
        updated_at: now,
        is_favorite: false,
        reading_time: Math.max(1, Math.ceil((postData.content || '').split(/\s+/).length / 200)),
        ...postData
      };
      posts.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return saved;
  }

  // Delete Post
  async deletePost(id) {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (e) {
        console.warn('Backend delete failed, deleting from local storage', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) return true;
    let posts = JSON.parse(raw);
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return true;
  }

  // Toggle Favorite
  async toggleFavorite(id) {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch(`/api/posts/${id}/favorite`, { method: 'PATCH' });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend favorite failed, toggling locally', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) return null;
    let posts = JSON.parse(raw);
    let updated = null;

    posts = posts.map(p => {
      if (p.id === id) {
        updated = { ...p, is_favorite: !p.is_favorite };
        return updated;
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return updated;
  }

  // Update Series (Rename, description, cover_image)
  async updateSeries(seriesData) {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch('/api/courses/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seriesData)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend series update failed, updating locally', e);
      }
    }

    const { oldName, newName, description, cover_image } = seriesData;
    const rawPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts = rawPosts ? JSON.parse(rawPosts) : [];

    // Rename course in posts if oldName != newName
    if (oldName && newName && oldName !== newName) {
      posts = posts.map(p => {
        if (p.course_name === oldName) {
          return { ...p, course_name: newName };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }

    // Update Series Meta
    const targetName = newName || oldName;
    let seriesList = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    const existingIdx = seriesList.findIndex(s => s.name === targetName || s.name === oldName);

    const updatedItem = {
      name: targetName,
      description: description !== undefined ? description : (existingIdx >= 0 ? seriesList[existingIdx].description : ''),
      cover_image: cover_image !== undefined ? cover_image : (existingIdx >= 0 ? seriesList[existingIdx].cover_image : '')
    };

    if (existingIdx >= 0) {
      seriesList[existingIdx] = updatedItem;
    } else {
      seriesList.push(updatedItem);
    }

    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(seriesList));
    return { message: 'Series updated locally' };
  }

  // Upload Image: Online uses /api/upload, Offline/GitHub Pages converts to Base64 Data URL
  async uploadImage(file) {
    if (this.mode === 'postgres') {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend upload failed, converting to Data URL', e);
      }
    }

    // Client-side Base64 convert
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result, fileName: file.name });
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Export Data to JSON
  exportData() {
    const rawPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    const rawCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const rawSeries = localStorage.getItem(STORAGE_KEYS.SERIES);

    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      posts: rawPosts ? JSON.parse(rawPosts) : [],
      categories: rawCategories ? JSON.parse(rawCategories) : [],
      series: rawSeries ? JSON.parse(rawSeries) : []
    };
  }

  // Import Data from JSON
  importData(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Format file JSON tidak valid');
    }

    if (Array.isArray(jsonData.posts)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(jsonData.posts));
    } else if (Array.isArray(jsonData)) {
      // In case user exported just an array of posts
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(jsonData));
    }

    if (Array.isArray(jsonData.categories)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(jsonData.categories));
    }

    if (Array.isArray(jsonData.series)) {
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(jsonData.series));
    }

    return true;
  }
}

export const storageService = new StorageService();
