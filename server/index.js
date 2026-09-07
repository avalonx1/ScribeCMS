import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { pool, initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Turndown HTML to Markdown Service configuration
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});
turndownService.use(gfm);

// Custom Turndown rule for video/iframe embeds (YouTube, Vimeo, video tags)
turndownService.addRule('iframeVideo', {
  filter: ['iframe'],
  replacement: (content, node) => {
    const src = node.getAttribute('src') || '';
    const title = node.getAttribute('title') || 'Video Embed';
    if (!src) return '';
    return `\n\n<iframe width="100%" height="420" src="${src}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="rounded-xl my-4 shadow-lg border border-slate-700"></iframe>\n\n`;
  }
});

turndownService.addRule('html5Video', {
  filter: ['video'],
  replacement: (content, node) => {
    const src = node.getAttribute('src') || (node.querySelector('source') ? node.querySelector('source').getAttribute('src') : '');
    if (!src) return '';
    return `\n\n<video controls width="100%" class="rounded-xl my-4 shadow-lg border border-slate-700"><source src="${src}" type="video/mp4">Your browser does not support video.</video>\n\n`;
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadDir));

// Helper: Calculate reading time
function calculateReadingTime(text) {
  const words = text ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

// Helper: Generate slug
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `${base}-${Date.now().toString().slice(-4)}`;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check & DB status
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'online', database: 'app_blog', serverTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'offline', error: err.message });
  }
});

// Stats overview
app.get('/api/stats', async (req, res) => {
  try {
    const totalPosts = await pool.query('SELECT COUNT(*) FROM posts');
    const totalCourses = await pool.query('SELECT COUNT(DISTINCT course_name) FROM posts WHERE course_name IS NOT NULL AND course_name != \'\'');
    const favPosts = await pool.query('SELECT COUNT(*) FROM posts WHERE is_favorite = true');
    const categoryCounts = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM posts 
      GROUP BY category 
      ORDER BY count DESC
    `);

    res.json({
      totalPosts: parseInt(totalPosts.rows[0].count, 10),
      totalCourses: parseInt(totalCourses.rows[0].count, 10),
      totalFavorites: parseInt(favPosts.rows[0].count, 10),
      categories: categoryCounts.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all posts with filtering & search
app.get('/api/posts', async (req, res) => {
  try {
    const { search, category, course, tag, favorite, status } = req.query;
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (title ILIKE $${idx} OR content ILIKE $${idx} OR course_name ILIKE $${idx} OR module_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (category && category !== 'All') {
      query += ` AND category = $${idx}`;
      params.push(category);
      idx++;
    }

    if (course) {
      query += ` AND course_name = $${idx}`;
      params.push(course);
      idx++;
    }

    if (tag) {
      query += ` AND $${idx} = ANY(tags)`;
      params.push(tag);
      idx++;
    }

    if (favorite === 'true') {
      query += ` AND is_favorite = true`;
    }

    if (status) {
      query += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single post by ID or slug
app.get('/api/posts/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let query, param;
    if (/^\d+$/.test(identifier)) {
      query = 'SELECT * FROM posts WHERE id = $1';
      param = parseInt(identifier, 10);
    } else {
      query = 'SELECT * FROM posts WHERE slug = $1';
      param = identifier;
    }

    const result = await pool.query(query, [param]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new post
app.post('/api/posts', async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      cover_image,
      category = 'Course Notes',
      course_name,
      module_name,
      tags = [],
      status = 'published',
      source_url,
      is_favorite = false
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan konten wajib diisi' });
    }

    const slug = generateSlug(title);
    const reading_time = calculateReadingTime(content);
    const generatedSummary = summary || content.replace(/#|\*|`|<[^>]*>|\[.*?\]\(.*?\)/g, '').slice(0, 180) + '...';

    const query = `
      INSERT INTO posts (
        title, slug, content, summary, cover_image, category, 
        course_name, module_name, tags, status, reading_time, is_favorite, source_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      title,
      slug,
      content,
      generatedSummary,
      cover_image || null,
      category,
      course_name || null,
      module_name || null,
      tags,
      status,
      reading_time,
      is_favorite,
      source_url || null
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      summary,
      cover_image,
      category,
      course_name,
      module_name,
      tags,
      status,
      source_url,
      is_favorite
    } = req.body;

    const reading_time = content ? calculateReadingTime(content) : undefined;
    const generatedSummary = summary || (content ? content.replace(/#|\*|`|<[^>]*>|\[.*?\]\(.*?\)/g, '').slice(0, 180) + '...' : undefined);

    const query = `
      UPDATE posts SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        summary = COALESCE($3, summary),
        cover_image = COALESCE($4, cover_image),
        category = COALESCE($5, category),
        course_name = COALESCE($6, course_name),
        module_name = COALESCE($7, module_name),
        tags = COALESCE($8, tags),
        status = COALESCE($9, status),
        reading_time = COALESCE($10, reading_time),
        is_favorite = COALESCE($11, is_favorite),
        source_url = COALESCE($12, source_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      title,
      content,
      generatedSummary,
      cover_image,
      category,
      course_name,
      module_name,
      tags,
      status,
      reading_time,
      is_favorite,
      source_url,
      id
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE Favorite
app.patch('/api/posts/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE posts SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json({ success: true, message: 'Catatan berhasil dihapus', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET courses list with counts, child notes, description, and cover_image from series table
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(s.name, p.course_name) as course_name, 
        s.description as description,
        s.cover_image as cover_image,
        COUNT(p.id) as total_modules, 
        COALESCE(MAX(p.updated_at), s.updated_at, CURRENT_TIMESTAMP) as last_updated,
        ARRAY_AGG(DISTINCT p.module_name) FILTER (WHERE p.module_name IS NOT NULL) as modules,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'title', p.title,
              'slug', p.slug,
              'module_name', p.module_name,
              'reading_time', reading_time,
              'created_at', p.created_at,
              'cover_image', p.cover_image,
              'is_favorite', p.is_favorite,
              'content', p.content,
              'summary', p.summary,
              'category', p.category,
              'tags', p.tags,
              'source_url', p.source_url
            ) ORDER BY p.created_at ASC
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as notes
      FROM series s
      FULL OUTER JOIN posts p ON s.name = p.course_name
      WHERE COALESCE(s.name, p.course_name) IS NOT NULL AND COALESCE(s.name, p.course_name) != ''
      GROUP BY COALESCE(s.name, p.course_name), s.description, s.cover_image, s.updated_at
      ORDER BY last_updated DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE course series (name, description, cover_image)
app.put('/api/courses/update', async (req, res) => {
  try {
    const { oldName, newName, description, cover_image } = req.body;
    const targetName = (newName || oldName || '').trim();
    if (!targetName) {
      return res.status(400).json({ error: 'Nama series wajib diisi' });
    }

    // 1. If name changed, update posts and series
    if (oldName && oldName !== targetName) {
      await pool.query(
        'UPDATE posts SET course_name = $1, updated_at = CURRENT_TIMESTAMP WHERE course_name = $2',
        [targetName, oldName]
      );
      await pool.query(
        'UPDATE series SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2',
        [targetName, oldName]
      );
    }

    // 2. Upsert into series table
    const result = await pool.query(`
      INSERT INTO series (name, description, cover_image, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (name) DO UPDATE SET
        description = COALESCE(EXCLUDED.description, series.description),
        cover_image = COALESCE(EXCLUDED.cover_image, series.cover_image),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [targetName, description || null, cover_image || null]);

    res.json({
      success: true,
      series: result.rows[0],
      message: `Series "${targetName}" berhasil diperbarui!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RENAME course series (backwards compatibility)
app.put('/api/courses/rename', async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName || !newName.trim()) {
      return res.status(400).json({ error: 'Nama series lama dan baru wajib diisi' });
    }
    const targetName = newName.trim();
    const result = await pool.query(
      'UPDATE posts SET course_name = $1, updated_at = CURRENT_TIMESTAMP WHERE course_name = $2 RETURNING id',
      [targetName, oldName]
    );
    await pool.query(`
      INSERT INTO series (name, updated_at)
      VALUES ($1, CURRENT_TIMESTAMP)
      ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    `, [targetName]);
    await pool.query('DELETE FROM series WHERE name = $1', [oldName]);

    res.json({ 
      success: true, 
      count: result.rowCount, 
      message: `Berhasil mengubah ${result.rowCount} catatan ke series "${targetName}"` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all unique tags
app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM posts
      GROUP BY tag
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST HTML to Markdown conversion (Smart Course Content Converter)
app.post('/api/convert-html', (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ error: 'HTML string required' });
    }
    const markdown = turndownService.turndown(html);
    res.json({ markdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Media Upload
app.post('/api/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Journal & Course CMS Backend running on http://localhost:${PORT}`);
  });
});
