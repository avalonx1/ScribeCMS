// Storage Service with Dual-Mode Architecture:
// 1. PostgreSQL Mode: Connected to local Express backend (/api/...)
// 2. Browser Storage Mode (Offline / GitHub Pages Demo): Powered by LocalStorage with rich seed data

const STORAGE_KEYS = {
  POSTS: 'scribecms_posts',
  CATEGORIES: 'scribecms_categories',
  SERIES: 'scribecms_series',
  NOTES: 'scribecms_notes'
};

const DEFAULT_NOTES = [
  {
    id: 1,
    title: '💡 Ide Kursus: AI Agent & LLM Orchestration',
    content: 'Buat seri course baru tentang arsitektur AI Agent lokal menggunakan LangChain, Ollama, dan vector store.\n\nRencana modul:\n- [ ] Modul 1: Konsep Agentic AI\n- [x] Modul 2: Memory & Tool Calling\n- [ ] Modul 3: Local RAG dengan PostgreSQL pgvector\n\nCatatan:\nSiapkan repositori starter kit sebelum rekaman video modul 1.',
    color: 'amber',
    is_pinned: true,
    tags: ['#ide', '#course', '#ai'],
    position: 0,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    title: '📌 Rencana Refactoring ScribeCMS',
    content: 'Task sprint minggu ini:\n- [x] Optimasi image compressor saat upload paste\n- [ ] Tambah keyboard shortcut Ctrl+S di editor\n- [ ] Export catatan ke format PDF & EPUB\n- [ ] Auto-backup berkala ke cloud storage\n\nCatatan evaluasi:\nPerforma rendering pada dokumen besar sudah jauh lebih cepat.',
    color: 'emerald',
    is_pinned: true,
    tags: ['#todo', '#fitur'],
    position: 1,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    title: '🎯 Target Menulis Minggu Ini',
    content: '1. Selesaikan artikel tentang React 19 Compiler\n2. Catat rangkuman webinar System Design\n3. Review performa query database di PostgreSQL',
    color: 'blue',
    is_pinned: false,
    tags: ['#target', '#draft'],
    position: 2,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 4,
    title: '🔗 Referensi Desain Modern 2026',
    content: 'Inspirasi UI minimalis & editorial:\n- Linear.app keyboard-first design\n- Notion dynamic nested blocks\n- Google Keep color-coded quick capture notes',
    color: 'purple',
    is_pinned: false,
    tags: ['#referensi', '#ui'],
    position: 3,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Course Notes', description: 'Catatan materi kursus & tutorial online dengan video/gambar', icon: 'GraduationCap', color: '#14b8a6' },
  { id: 2, name: 'Daily Journal', description: 'Catatan harian, refleksi, dan ide', icon: 'BookOpen', color: '#10b981' },
  { id: 3, name: 'Tech & Dev', description: 'Snippet kode, arsitektur, dan referensi pemrograman', icon: 'Code2', color: '#f59e0b' },
  { id: 4, name: 'Webinar & Videos', description: 'Rangkuman video materi kursus dan webinar', icon: 'Video', color: '#ec4899' }
];

const DEFAULT_SERIES = [
  {
    name: 'Fullstack Next.js 15 & React 19 Pro',
    description: 'Panduan komprehensif arsitektur Next.js 15 App Router, React Server Components, Server Actions, dan deployment production.',
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    post_count: 3
  },
  {
    name: 'System Design & Microservices Architecture',
    description: 'Mempelajari perancangan sistem backend berskala jutaan pengguna, event-driven messaging, data caching, dan sharding.',
    cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    post_count: 2
  },
  {
    name: 'Generative AI & Agentic Workflow Engineering',
    description: 'Membangun autonomous AI agent cerdas, Retrieval-Augmented Generation (RAG) lokal, dan tool calling menggunakan LangGraph.',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    post_count: 3
  }
];

const DEFAULT_POSTS = [
  // SERIES 1: Fullstack Next.js 15 & React 19 Pro
  {
    id: 1,
    title: 'Mastering Next.js 15 App Router & Server Actions',
    slug: 'mastering-nextjs-15-app-router-server-actions',
    summary: 'Konsep inti React Server Components (RSC), mutasi data form dengan Server Actions, dan integrasi video tutorial interaktif.',
    category: 'Course Notes',
    course_name: 'Fullstack Next.js 15 & React 19 Pro',
    module_name: 'Modul 1: Server Components & Actions',
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    tags: ['React19', 'Next.js', 'WebDev', 'Tutorial'],
    reading_time: 4,
    is_favorite: true,
    source_url: 'https://nextjs.org/docs',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    content: `# Mastering Next.js 15 App Router & Server Actions

Selamat datang di catatan modul 1 seri kursus **Fullstack Next.js 15 & React 19 Pro**. Catatan ini merangkum pembahasan konsep inti App Router, Server Components, dan integrasi video tutorial interaktif.

## 📺 Video Pembelajaran Modul 1
Pelajari arsitektur rendering Next.js melalui video berikut:

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

> 💡 **Tip Course**: Gunakan \`useOptimistic\` untuk memberikan feedback instan ke user sebelum response server selesai.`
  },
  {
    id: 2,
    title: 'Database PostgreSQL, Drizzle ORM & Schema Design',
    slug: 'database-postgresql-drizzle-orm-schema-design',
    summary: 'Membangun relasi database yang cepat, type-safe query dengan Drizzle ORM, dan teknik migrasi skema database.',
    category: 'Tech & Dev',
    course_name: 'Fullstack Next.js 15 & React 19 Pro',
    module_name: 'Modul 2: Database & ORM Setup',
    cover_image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop',
    tags: ['PostgreSQL', 'DrizzleORM', 'Database'],
    reading_time: 5,
    is_favorite: false,
    source_url: 'https://orm.drizzle.team',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    content: `# Database PostgreSQL, Drizzle ORM & Schema Design

Panduan praktis merancang skema database PostgreSQL berkinerja tinggi menggunakan Drizzle ORM untuk aplikasi skala modern.

## 📊 Definisi Skema Tabel dengan Drizzle ORM
\`\`\`typescript
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  courseName: text('course_name'),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
\`\`\`

> ⚡ **Tips:** Selalu jalankan \`npx drizzle-kit generate\` untuk membuat migrasi SQL terstruktur sebelum deployment.`
  },
  {
    id: 3,
    title: 'Authentication Auth.js v5 & Production CI/CD',
    slug: 'authentication-authjs-v5-production-cicd',
    summary: 'Implementasi secure session cookie, OAuth 2.0 Google/GitHub, middleware protection, dan otomatisasi deployment.',
    category: 'Course Notes',
    course_name: 'Fullstack Next.js 15 & React 19 Pro',
    module_name: 'Modul 3: Keamanan & Deployment',
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    tags: ['Auth', 'Security', 'DevOps'],
    reading_time: 4,
    is_favorite: false,
    source_url: 'https://authjs.dev',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    content: `# Authentication Auth.js v5 & Production CI/CD

Mengamankan rute aplikasi web menggunakan Auth.js v5 dengan session berbasis JWT yang dienkripsi ketat.

## 🛡️ Best Practice Keamanan
- Aktifkan \`httpOnly\` dan \`sameSite: 'lax'\` pada semua cookie sesi
- Validasi origin header pada setiap Server Action untuk mencegah CSRF
- Konfigurasikan GitHub Actions pipeline untuk automated testing sebelum push ke branch produksi.`
  },

  // SERIES 2: System Design & Microservices Architecture
  {
    id: 4,
    title: 'Event-Driven Architecture dengan Apache Kafka & Redis',
    slug: 'event-driven-architecture-apache-kafka-redis',
    summary: 'Pola asynchronous messaging, consumer groups, message deduplication, dan distributed locking di Redis.',
    category: 'Tech & Dev',
    course_name: 'System Design & Microservices Architecture',
    module_name: 'Modul 1: Asynchronous Event Streaming',
    cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    tags: ['SystemDesign', 'Kafka', 'Redis', 'Microservices'],
    reading_time: 6,
    is_favorite: true,
    source_url: 'https://kafka.apache.org',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    content: `# Event-Driven Architecture dengan Apache Kafka & Redis

Merancang sistem desentralisasi yang tahan terhadap traffic lonjakan tinggi (high-throughput) dengan event streaming.

## 🔄 Pola Alur Event (Event Flow)
1. **Producer Service** menerbitkan event perubahan data ke Kafka Topic.
2. **Broker** mempartisi pesan untuk menjamin urutan pemrosesan per entity ID.
3. **Consumer Services** membaca event secara independen tanpa saling memblokir.

\`\`\`javascript
// Contoh idempotent message processing dengan Redis
async function processEvent(event) {
  const isDuplicate = await redis.set(\`processed:\${event.id}\`, '1', 'NX', 'EX', 86400);
  if (!isDuplicate) {
    console.log('Event sudah diproses sebelumnya, skip.');
    return;
  }
  await executeBusinessLogic(event);
}
\`\`\`

> 💡 **Callout:** Selalu terapkan pola *Dead Letter Queue (DLQ)* untuk menangani pesan yang gagal diproses berkali-kali.`
  },
  {
    id: 5,
    title: 'Database Partitioning, Sharding & Multi-Region Caching',
    slug: 'database-partitioning-sharding-multi-region-caching',
    summary: 'Teknik memecah tabel besar (horizontal sharding), replication lag, dan strategi cache-aside vs write-through.',
    category: 'Tech & Dev',
    course_name: 'System Design & Microservices Architecture',
    module_name: 'Modul 2: Skalabilitas Data',
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    tags: ['Database', 'Sharding', 'Caching', 'Scalability'],
    reading_time: 5,
    is_favorite: false,
    source_url: 'https://highscalability.com',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    content: `# Database Partitioning, Sharding & Multi-Region Caching

Ketika basis data mencapai miliaran baris data, teknik partitioning dan caching berlapis menjadi kewajiban arsitektur.

## 📊 Latency Comparison Matrix
| Storage Layer | Rata-rata Latensi | Kapasitas Rekomendasi |
| :--- | :--- | :--- |
| **L1 CPU Cache** | < 1 ns | Kilobytes |
| **RAM (Redis / Memcached)** | ~ 0.1 - 0.5 ms | Gigabytes |
| **SSD / NVMe (PostgreSQL)** | ~ 1 - 5 ms | Terabytes |
| **Cross-Region Network Read** | ~ 50 - 150 ms | Tak terbatas |`
  },

  // SERIES 3: Generative AI & Agentic Workflow Engineering
  {
    id: 6,
    title: 'Konsep Dasar Agentic AI & Tool Calling Orchestration',
    slug: 'konsep-dasar-agentic-ai-tool-calling-orchestration',
    summary: 'Bagaimana LLM menentukan kapan harus berpikir, memanggil fungsi API eksternal, dan mengembalikan hasil ke pengguna.',
    category: 'Course Notes',
    course_name: 'Generative AI & Agentic Workflow Engineering',
    module_name: 'Modul 1: ReAct Loop & Function Calling',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    tags: ['AI', 'LLM', 'AgenticAI', 'Automation'],
    reading_time: 5,
    is_favorite: true,
    source_url: 'https://langchain.com',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    content: `# Konsep Dasar Agentic AI & Tool Calling Orchestration

Agentic AI merevolusi cara kerja AI dari sekadar chatbot interaktif menjadi agen yang mampu melakukan tindakan nyata di dunia komputasi.

## 🧠 Pola ReAct (Reasoning + Acting)
Siklus kerja autonomous agent terdiri dari 3 tahapan berulang:
1. **Thought**: Menganalisa input pengguna dan memecah masalah menjadi rencana langkah-langkah.
2. **Action**: Memilih alat (tool) yang tepat dan mengeksekusi dengan argumen JSON yang valid.
3. **Observation**: Membaca hasil eksekusi alat dan memutuskan apakah tugas sudah selesai atau butuh tindakan lanjutan.

> 🤖 **Insight:** Kunci keandalan agen adalah skema tool yang presisi dan instruksi pembatas (*guardrails*) yang jelas.`
  },
  {
    id: 7,
    title: 'Local RAG Pipeline dengan PostgreSQL pgvector & Embeddings',
    slug: 'local-rag-pipeline-postgresql-pgvector-embeddings',
    summary: 'Menyimpan representasi vektor artikel ke dalam database PostgreSQL dan pencarian semantik dengan cosine distance.',
    category: 'Tech & Dev',
    course_name: 'Generative AI & Agentic Workflow Engineering',
    module_name: 'Modul 2: Vector Search & Chunking',
    cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    tags: ['RAG', 'pgvector', 'Embedding', 'PostgreSQL'],
    reading_time: 6,
    is_favorite: false,
    source_url: 'https://github.com/pgvector/pgvector',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    content: `# Local RAG Pipeline dengan PostgreSQL pgvector & Embeddings

Panduan membangun Retrieval-Augmented Generation (RAG) secara mandiri tanpa ketergantungan pada vector database berbayar eksternal.

## 🔍 Menggunakan Ekstensi pgvector
\`\`\`sql
-- Mengaktifkan ekstensi vektor
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabel catatan dengan embedding 1536 dimensi
CREATE TABLE document_embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536)
);

-- Query pencarian semantik dengan Cosine Similarity (<=> operator)
SELECT content, 1 - (embedding <=> $1) AS similarity
FROM document_embeddings
ORDER BY embedding <=> $1
LIMIT 5;
\`\`\`

> 💡 **Tip:** Gunakan semantic chunking (memotong dokumen berdasarkan paragraf atau bab) daripada karakter mentah agar konteks tidak hilang.`
  },
  {
    id: 8,
    title: 'Multi-Agent Collaboration dengan LangGraph & State Machine',
    slug: 'multi-agent-collaboration-langgraph-state-machine',
    summary: 'Pola arsitektur Supervisor Agent yang mendelegasikan tugas ke sub-agent riset, penulisan kode, dan reviewer.',
    category: 'Course Notes',
    course_name: 'Generative AI & Agentic Workflow Engineering',
    module_name: 'Modul 3: Multi-Agent Systems',
    cover_image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop',
    tags: ['LangGraph', 'MultiAgent', 'Workflow'],
    reading_time: 5,
    is_favorite: true,
    source_url: 'https://langchain-ai.github.io/langgraph/',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: `# Multi-Agent Collaboration dengan LangGraph & State Machine

Ketika sebuah pekerjaan pemrograman terlalu rumit untuk satu LLM, arsitektur multi-agen membagi tugas layaknya tim insinyur perangkat lunak sungguhan.

## 👥 Peran Agen Kolaboratif
- **Supervisor Agent**: Manajer proyek yang menganalisa spesifikasi fitur dan membagi tiket ke spesialis.
- **Coder Agent**: Mengimplementasikan kode sesuai instruksi teknis.
- **Reviewer Agent**: Membaca kode, memeriksa celah keamanan, dan memberikan feedback perbaikan otomatis.

\`\`\`mermaid
graph TD
    User([Permintaan User]) --> Supervisor[Supervisor Agent]
    Supervisor --> Researcher[Research Agent]
    Researcher --> Supervisor
    Supervisor --> Coder[Coder Agent]
    Coder --> Reviewer[Code Reviewer]
    Reviewer -->|Perlu Perbaikan| Coder
    Reviewer -->|Lulus Uji| FinalOutput([Hasil Sempurna])
\`\`\`

> 🚀 **Kesimpulan:** Kolaborasi multi-agen terstruktur menghasilkan akurasi kode yang jauh melampaui pendekatan prompt tunggal.`
  }
];

class StorageService {
  constructor() {
    this.mode = 'checking'; // 'postgres' | 'local' | 'checking'
    this.initLocalStorage();
  }

  initLocalStorage() {
    const rawPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts = rawPosts ? JSON.parse(rawPosts) : null;
    // If posts are missing or have fewer than 5 posts, seed with complete 3-course examples
    if (!posts || posts.length < 5) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    }

    const rawSeries = localStorage.getItem(STORAGE_KEYS.SERIES);
    let series = rawSeries ? JSON.parse(rawSeries) : null;
    if (!series || series.length < 3) {
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(DEFAULT_SERIES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
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

    // 1. Seed with registered series meta
    seriesMeta.forEach(meta => {
      if (meta.name) {
        coursesMap[meta.name] = {
          course_name: meta.name,
          post_count: 0,
          total_modules: 0,
          notes: [],
          description: meta.description || '',
          cover_image: meta.cover_image || '',
          last_updated: meta.last_updated || new Date().toISOString()
        };
      }
    });

    // 2. Attach posts and child notes
    posts.forEach(p => {
      if (p.course_name) {
        if (!coursesMap[p.course_name]) {
          const meta = seriesMeta.find(s => s.name === p.course_name) || {};
          coursesMap[p.course_name] = {
            course_name: p.course_name,
            post_count: 0,
            total_modules: 0,
            notes: [],
            description: meta.description || '',
            cover_image: meta.cover_image || '',
            last_updated: p.updated_at || p.created_at || new Date().toISOString()
          };
        }
        coursesMap[p.course_name].post_count += 1;
        coursesMap[p.course_name].notes.push(p);
        coursesMap[p.course_name].total_modules = coursesMap[p.course_name].notes.length;
        if (p.updated_at || p.created_at) {
          coursesMap[p.course_name].last_updated = p.updated_at || p.created_at;
        }
      }
    });

    // 3. Sort child notes chronologically by created_at
    Object.values(coursesMap).forEach(c => {
      if (c.notes && c.notes.length > 0) {
        c.notes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
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

  // -------------------------------------------------------------
  // Sticky Notes Methods (Google Keep-style Dual-Mode)
  // -------------------------------------------------------------
  async getNotes({ search = '', tag = '' } = {}) {
    if (this.mode === 'postgres') {
      try {
        let url = '/api/notes?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (tag && tag !== 'All') url += `tag=${encodeURIComponent(tag)}&`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend failed, falling back to local notes', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    let notes = raw ? JSON.parse(raw) : DEFAULT_NOTES;

    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (tag && tag !== 'All') {
      notes = notes.filter(n => n.tags && n.tags.includes(tag));
    }

    // Sort: is_pinned desc, position asc, updated_at desc
    return notes.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
      if (a.position !== b.position) return (a.position || 0) - (b.position || 0);
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    });
  }

  async saveNote(noteData) {
    if (this.mode === 'postgres') {
      try {
        let res;
        if (noteData.id) {
          res = await fetch(`/api/notes/${noteData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
          });
        } else {
          res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
          });
        }
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend note save failed, saving to local storage', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    let notes = raw ? JSON.parse(raw) : [...DEFAULT_NOTES];

    if (noteData.id) {
      const idx = notes.findIndex(n => n.id === noteData.id);
      if (idx >= 0) {
        notes[idx] = {
          ...notes[idx],
          ...noteData,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
        return notes[idx];
      }
    }

    // Create new note
    const maxPos = notes.reduce((max, n) => Math.max(max, n.position || 0), 0);
    const newNote = {
      id: Date.now(),
      title: noteData.title || '',
      content: noteData.content || '',
      color: noteData.color || 'default',
      is_pinned: !!noteData.is_pinned,
      tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      position: maxPos + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return newNote;
  }

  async deleteNote(id) {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (e) {
        console.warn('Backend note delete failed, deleting locally', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) {
      const notes = JSON.parse(raw).filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
    return true;
  }

  async togglePinNote(id) {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    let notes = raw ? JSON.parse(raw) : [...DEFAULT_NOTES];
    const target = notes.find(n => n.id === id);
    const nextPinned = target ? !target.is_pinned : true;

    return await this.saveNote({ id, is_pinned: nextPinned });
  }

  async reorderNotes(items) {
    if (this.mode === 'postgres') {
      try {
        const res = await fetch('/api/notes/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
        if (res.ok) return true;
      } catch (e) {
        console.warn('Backend reorder failed, saving locally', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return true;

    let notes = JSON.parse(raw);
    const itemsMap = new Map(items.map(it => [it.id, it]));

    notes = notes.map(n => {
      const update = itemsMap.get(n.id);
      if (update) {
        return {
          ...n,
          position: update.position,
          is_pinned: update.is_pinned !== undefined ? update.is_pinned : n.is_pinned,
          updated_at: new Date().toISOString()
        };
      }
      return n;
    });

    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return true;
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
    const rawNotes = localStorage.getItem(STORAGE_KEYS.NOTES);

    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      posts: rawPosts ? JSON.parse(rawPosts) : [],
      categories: rawCategories ? JSON.parse(rawCategories) : [],
      series: rawSeries ? JSON.parse(rawSeries) : [],
      notes: rawNotes ? JSON.parse(rawNotes) : []
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

    if (Array.isArray(jsonData.notes)) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(jsonData.notes));
    }

    return true;
  }
}

export const storageService = new StorageService();
