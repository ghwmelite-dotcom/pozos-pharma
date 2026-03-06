import { authMiddleware, requireRole } from '../middleware/auth.js';

export async function handleArticles(request, env, path) {
  const url = new URL(request.url);

  // GET /api/articles/featured
  if (path === '/api/articles/featured' && request.method === 'GET') {
    return getFeaturedArticles(env);
  }

  // GET /api/articles/drug-of-week
  if (path === '/api/articles/drug-of-week' && request.method === 'GET') {
    return getDrugOfWeek(env);
  }

  // GET /api/articles/:slug (single article)
  const slugMatch = path.match(/^\/api\/articles\/([a-z0-9-]+)$/);
  if (slugMatch && request.method === 'GET') {
    return getArticleBySlug(env, slugMatch[1]);
  }

  // GET /api/articles - list articles
  if (path === '/api/articles' && request.method === 'GET') {
    return listArticles(url, env);
  }

  // POST /api/articles - create article (admin only)
  if (path === '/api/articles' && request.method === 'POST') {
    const { user, error } = await requireRole(request, env, 'admin');
    if (error) return error;
    return createArticle(request, env, user);
  }

  // PUT /api/articles/:id - update article (admin only)
  const updateMatch = path.match(/^\/api\/articles\/([a-zA-Z0-9-]+)$/);
  if (updateMatch && request.method === 'PUT') {
    const { user, error } = await requireRole(request, env, 'admin');
    if (error) return error;
    return updateArticle(request, env, updateMatch[1]);
  }

  return null;
}

async function listArticles(url, env) {
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');
  const drugOfWeek = url.searchParams.get('drug_of_week');
  const q = url.searchParams.get('q');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  let sql = 'SELECT id, title, slug, summary, category, tags, featured, published, views, drug_of_week, created_at, updated_at FROM health_articles WHERE published = 1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (featured === '1') {
    sql += ' AND featured = 1';
  }
  if (drugOfWeek === '1') {
    sql += ' AND drug_of_week = 1';
  }
  if (q) {
    sql += ' AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += ' ORDER BY drug_of_week DESC, featured DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await env.DB.prepare(sql).bind(...params).all();

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM health_articles WHERE published = 1';
  const countParams = [];
  if (category) {
    countSql += ' AND category = ?';
    countParams.push(category);
  }
  if (featured === '1') {
    countSql += ' AND featured = 1';
  }
  if (drugOfWeek === '1') {
    countSql += ' AND drug_of_week = 1';
  }
  if (q) {
    countSql += ' AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${q}%`;
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  const countResult = countParams.length > 0
    ? await env.DB.prepare(countSql).bind(...countParams).first()
    : await env.DB.prepare(countSql).first();

  return json({
    articles: result.results || [],
    total: countResult?.total || 0,
    page,
    limit
  });
}

async function getArticleBySlug(env, slug) {
  const article = await env.DB.prepare(
    'SELECT * FROM health_articles WHERE slug = ? AND published = 1'
  ).bind(slug).first();

  if (!article) {
    return json({ error: 'Article not found' }, 404);
  }

  // Increment views
  await env.DB.prepare(
    'UPDATE health_articles SET views = views + 1 WHERE slug = ?'
  ).bind(slug).run();

  // Get related articles (same category, excluding current)
  const related = await env.DB.prepare(
    'SELECT id, title, slug, summary, category, tags, views, created_at FROM health_articles WHERE category = ? AND slug != ? AND published = 1 ORDER BY views DESC LIMIT 4'
  ).bind(article.category, slug).all();

  return json({
    article: { ...article, views: article.views + 1 },
    related: related.results || []
  });
}

async function getFeaturedArticles(env) {
  const result = await env.DB.prepare(
    'SELECT id, title, slug, summary, category, tags, featured, views, created_at FROM health_articles WHERE featured = 1 AND published = 1 ORDER BY created_at DESC LIMIT 5'
  ).all();

  return json({ articles: result.results || [] });
}

async function getDrugOfWeek(env) {
  const article = await env.DB.prepare(
    'SELECT id, title, slug, summary, content, category, tags, views, created_at FROM health_articles WHERE drug_of_week = 1 AND published = 1 ORDER BY updated_at DESC LIMIT 1'
  ).first();

  if (!article) {
    return json({ error: 'No drug of the week found' }, 404);
  }

  return json({ article });
}

async function createArticle(request, env, user) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { title, slug, summary, content, category, tags, featured, drug_of_week } = body;

  if (!title || !slug || !summary || !content || !category) {
    return json({ error: 'Missing required fields: title, slug, summary, content, category' }, 400);
  }

  const id = 'art-' + crypto.randomUUID().slice(0, 8);

  try {
    await env.DB.prepare(
      `INSERT INTO health_articles (id, title, slug, summary, content, category, tags, author_type, author_id, featured, drug_of_week)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'admin', ?, ?, ?)`
    ).bind(
      id, title, slug, summary, content, category,
      tags || null, user.id || user.sub, featured ? 1 : 0, drug_of_week ? 1 : 0
    ).run();

    return json({ id, message: 'Article created successfully' }, 201);
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return json({ error: 'An article with this slug already exists' }, 409);
    }
    throw err;
  }
}

async function updateArticle(request, env, id) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const fields = [];
  const params = [];

  for (const key of ['title', 'slug', 'summary', 'content', 'category', 'tags']) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(body[key]);
    }
  }

  for (const key of ['featured', 'published', 'drug_of_week']) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(body[key] ? 1 : 0);
    }
  }

  if (fields.length === 0) {
    return json({ error: 'No fields to update' }, 400);
  }

  fields.push('updated_at = unixepoch()');
  params.push(id);

  await env.DB.prepare(
    `UPDATE health_articles SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  return json({ message: 'Article updated successfully' });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
