import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/content
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category_id = searchParams.get('category_id');
        const content_type = searchParams.get('content_type');

        const session = await getSession();
        const isAuthenticated = !!session;

        let sql = '';
        const params = [];

        if (isAuthenticated) {
            sql = `
        SELECT c.*, cat.name as category_name, cat.slug as category_slug,
               u.first_name, u.last_name, u.title as author_title,
               EXISTS(SELECT 1 FROM user_favorites WHERE user_id = ? AND content_id = c.id) as is_favorite
        FROM content_items c
        LEFT JOIN content_categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.is_published = 1
      `;
            params.push(session.id);
        } else {
            sql = `
        SELECT c.id, c.title, c.slug, c.description, c.content_type, 
               c.category_id, c.requires_auth, c.created_at, c.views, c.downloads, 
               c.cover_image, c.pdf_url, c.video_url, c.pptx_url, c.reference_pdf_url,
               cat.name as category_name, cat.slug as category_slug
        FROM content_items c
        LEFT JOIN content_categories cat ON c.category_id = cat.id
        WHERE c.is_published = 1
      `;
        }

        if (category_id) {
            sql += ' AND (c.category_id = ? OR c.category_id IN (SELECT id FROM content_categories WHERE parent_id = ?))';
            params.push(category_id, category_id);
        }

        if (content_type) {
            sql += ' AND c.content_type = ?';
            params.push(content_type);
        }

        sql += ' ORDER BY c.display_order ASC, c.created_at DESC';

        const content = await query(sql, params);

        return NextResponse.json({
            success: true,
            data: content,
            authenticated: isAuthenticated
        });
    } catch (error) {
        console.error('Content GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/content
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin', 'editor'].includes(session.role as string)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const required = ['title', 'slug', 'category_id', 'content_type'];
        for (const field of required) {
            if (!body[field]) {
                return NextResponse.json({ success: false, message: `Field ${field} is required` }, { status: 400 });
            }
        }

        // Check slug
        const existing = await query('SELECT id FROM content_items WHERE slug = ?', [body.slug]);
        if ((existing as any[]).length > 0) {
            return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 });
        }

        const sql = `
      INSERT INTO content_items 
      (category_id, title, meta_title, slug, description, content_type, 
       pdf_url, pdf_pages, pdf_file_size,
       video_url, video_duration, video_thumbnail, video_platform,
       text_content, cover_image,
       author_id, requires_auth, display_order, tags, meta_description, has_download, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const is_published = body.is_published ?? false;
        const published_at = is_published ? new Date() : null;

        const result = await query<any>(sql, [
            body.category_id,
            body.title,
            body.meta_title || null,
            body.slug,
            body.description || null,
            body.content_type,
            body.pdf_url || null,
            body.pdf_pages || null,
            body.pdf_file_size || null,
            body.video_url || null,
            body.video_duration || null,
            body.video_thumbnail || null,
            body.video_platform || null,
            body.text_content || null,
            body.cover_image || null,
            session.id,
            body.requires_auth ?? true,
            body.display_order ?? 0,
            body.tags ? JSON.stringify(body.tags) : null,
            body.meta_description || null,
            body.has_download ?? false,
            is_published,
            published_at
        ]);

        return NextResponse.json({ success: true, message: 'Content created', data: { id: result.insertId } }, { status: 201 });
    } catch (error) {
        console.error('Content POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
