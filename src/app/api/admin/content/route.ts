import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin', 'editor'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category') || 'all';
        const offset = (page - 1) * limit;

        console.log('GET /api/admin/content:', { page, limit, search, categoryId });

        let whereClause = '1=1';
        const queryParams: any[] = [];

        if (search) {
            whereClause += ' AND (c.title LIKE ? OR c.slug LIKE ?)';
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        if (categoryId !== 'all') {
            whereClause += ' AND c.category_id = ?';
            queryParams.push(parseInt(categoryId));
        }

        // Get total count for pagination
        const countSql = `
            SELECT COUNT(*) as total 
            FROM content_items c 
            WHERE ${whereClause}
        `;
        const countResult = await query<{ total: number }[]>(countSql, queryParams);
        const total = countResult[0]?.total || 0;

        // Get paginated data
        const sql = `
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM content_items c
            LEFT JOIN content_categories cat ON c.category_id = cat.id
            WHERE ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const finalParams = [...queryParams, limit, offset];
        const content = await query(sql, finalParams);
        console.log('Admin Content Items Found:', (content as any[]).length);

        return NextResponse.json({
            success: true,
            data: content,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin Content GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin', 'editor'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, slug, category_id, content_type } = body;

        if (!title || !slug || !category_id || !content_type) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const result: any = await query(
            'INSERT INTO content_items (title, slug, category_id, content_type, author_id, prepared_by, description, text_content, reference_pdf_url, cover_image, video_url, pdf_url, pptx_url, requires_auth, is_published, content_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                title,
                slug,
                category_id,
                content_type,
                (session as any).id,
                body.prepared_by || null,
                body.description || '',
                body.text_content || '',
                body.reference_pdf_url || null,
                body.cover_image || null,
                body.video_url || null,
                body.pdf_url || null,
                body.pptx_url || null,
                body.requires_auth ? 1 : 0,
                body.is_published ? 1 : 0,
                body.content_order ? JSON.stringify(body.content_order) : JSON.stringify(['text', 'pdf', 'video', 'pptx'])
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Content created successfully',
            id: result.insertId
        });
    } catch (error: any) {
        console.error('Content POST error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ success: false, message: 'Bu URL adresi (slug) zaten kullanımda.' }, { status: 400 });
        }

        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
