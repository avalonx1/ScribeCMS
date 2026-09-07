import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'admin',
  database: process.env.PGDATABASE || 'app_blog',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection and initialize tables
export async function initDb() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL Database: app_blog');

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'BookOpen',
        color VARCHAR(20) DEFAULT '#14b8a6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        cover_image TEXT,
        category VARCHAR(100) DEFAULT 'Course Notes',
        course_name VARCHAR(150),
        module_name VARCHAR(150),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'published',
        reading_time INTEGER DEFAULT 1,
        is_favorite BOOLEAN DEFAULT FALSE,
        source_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS media_assets (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(50),
        file_size BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS series (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        slug VARCHAR(150),
        description TEXT,
        cover_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if categories are empty and seed default ones
    const catCheck = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO categories (name, description, icon, color) VALUES
        ('Course Notes', 'Catatan materi kursus & tutorial online dengan video/gambar', 'GraduationCap', '#14b8a6'),
        ('Daily Journal', 'Catatan harian, refleksi, dan ide', 'BookOpen', '#10b981'),
        ('Tech & Dev', 'Snippet kode, arsitektur, dan referensi pemrograman', 'Code2', '#f59e0b'),
        ('Webinar & Videos', 'Rangkuman video materi kursus dan webinar', 'Video', '#ec4899')
      `);
    }

    // Check if posts are empty and seed initial sample course & journal
    const postCheck = await client.query('SELECT COUNT(*) FROM posts');
    if (parseInt(postCheck.rows[0].count, 10) === 0) {
      const samplePost1 = {
        title: 'Mastering Next.js 15 & React 19: Full Course Notes',
        slug: 'mastering-nextjs-15-react-19',
        summary: 'Catatan komprehensif dari course Next.js 15 App Router, Server Actions, dan integrasi video tutorial.',
        category: 'Course Notes',
        course_name: 'Next.js 15 Architecture 2026',
        module_name: 'Module 1: Server Components & Actions',
        tags: ['React', 'Next.js', 'Tutorial', 'Web Development'],
        reading_time: 4,
        is_favorite: true,
        source_url: 'https://youtube.com',
        content: `# Mastering Next.js 15 & React 19: Full Course Notes

Selamat datang di catatan modul kursus **Next.js 15 & React 19**. Catatan ini merangkum pembahasan konsep inti App Router, Server Components, dan integrasi video tutorial interaktif.

## 📺 Video Tutorial Modul 1
Tonton video pembelajaran resmi di bawah ini:

<iframe width="100%" height="420" src="https://www.youtube.com/embed/Sklc_fQBmcs" title="Next.js 15 Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="rounded-xl my-4 shadow-lg border border-slate-700"></iframe>

---

## 🚀 Key Takeaways dari Course

1. **React Server Components (RSC)**: Komponen di-render secara default di server untuk performa super cepat tanpa mengirim beban JS berlebih ke client.
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
      };

      await client.query(`
        INSERT INTO posts (title, slug, summary, content, category, course_name, module_name, tags, reading_time, is_favorite, source_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        samplePost1.title,
        samplePost1.slug,
        samplePost1.summary,
        samplePost1.content,
        samplePost1.category,
        samplePost1.course_name,
        samplePost1.module_name,
        samplePost1.tags,
        samplePost1.reading_time,
        samplePost1.is_favorite,
        samplePost1.source_url
      ]);
    }

    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL Connection Error:', err.message);
  }
}
