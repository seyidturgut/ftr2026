import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/content/[slug] (Looks up by slug)
// PUT /api/content/[slug] (Looks up by ID, assumes slug param is ID)
// DELETE /api/content/[slug] (Looks up by ID)

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const session = await getSession();
        const isAuthenticated = !!session;

        const sql = `
      SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.page_type,
             u.first_name, u.last_name, u.title as author_title,
             EXISTS(SELECT 1 FROM user_favorites WHERE user_id = ? AND content_id = c.id) as is_favorite
      FROM content_items c
      LEFT JOIN content_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.slug = ? AND c.is_published = 1
    `;

        const contentItems = await query<any[]>(sql, [session?.id || 0, slug]);
        const content = contentItems[0];

        if (!content) {
            return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });
        }

        if (content.requires_auth && !isAuthenticated) {
            return NextResponse.json({
                success: true,
                data: {
                    id: content.id,
                    title: content.title,
                    slug: content.slug,
                    description: content.description,
                    content_type: content.content_type,
                    category_name: content.category_name,
                    requires_auth: true,
                    authenticated: false
                },
                message: 'Authentication required'
            });
        }

        // Inc views
        await query('UPDATE content_items SET views = views + 1 WHERE id = ?', [content.id]);

        // Fetch all categories to build breadcrumb path in JS (MySQL 5.7 compatible)
        let breadcrumbs: any[] = [];
        if (content.category_id) {
            const allCats = await query<any[]>('SELECT id, name, slug, parent_id FROM content_categories');
            const path: any[] = [];
            let currentId = content.category_id;
            while (currentId) {
                const cat = allCats.find(c => c.id === currentId);
                if (cat) {
                    path.unshift(cat);
                    currentId = cat.parent_id;
                } else break;
            }
            breadcrumbs = path;
        }

        return NextResponse.json({
            success: true,
            data: { ...content, breadcrumbs },
            authenticated: isAuthenticated
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug: id } = await params; // Treat as ID for updates
        const session = await getSession();

        if (!session || !['fulladmin', 'admin', 'editor'].includes(session.role as string)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        // Check ownership
        if (!['fulladmin', 'admin'].includes(session.role as string)) {
            const items = await query<any[]>('SELECT author_id FROM content_items WHERE id = ?', [id]);
            if (!items.length || items[0].author_id !== session.id) {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
            }
        }

        const body = await req.json();
        const updates: string[] = [];
        const values: any[] = [];

        const allowedFields = [
            'title', 'meta_title', 'slug', 'description', 'category_id', 'content_type',
            'pdf_url', 'pdf_pages', 'pdf_file_size', 'video_url', 'video_duration', 'video_thumbnail', 'video_platform',
            'text_content', 'cover_image', 'requires_auth', 'display_order', 'meta_description', 'has_download', 'is_published'
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                if (field === 'tags') {
                    values.push(JSON.stringify(body[field]));
                } else if (field === 'is_published' && body[field]) {
                    // Handle publish update Logic separately? No, standard update.
                    // But if specific logic needed for published_at:
                    values.push(body[field]);
                } else {
                    values.push(body[field]);
                }
            }
        });

        // logic for published_at handled? 
        if (body.is_published) {
            updates.push('published_at = NOW()');
        }

        if (body.tags) {
            updates.push('tags = ?');
            values.push(JSON.stringify(body.tags));
        }

        if (updates.length > 0) {
            values.push(id);
            // Remove duplicates if any (e.g. tags logic above duplicated) - Simplify:
            // Actually standard loop is fine, but special cases need care. 
            // Let's rewrite loop cleanly in a real implementation, but for now this is roughly compatible.
            // Better: strict separation.
        }

        // Improved update logic:
        const finalUpdates: string[] = [];
        const finalValues: any[] = [];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                finalUpdates.push(`${field} = ?`);
                finalValues.push(body[field]);
            }
        });

        if (body.tags !== undefined) {
            finalUpdates.push('tags = ?');
            finalValues.push(JSON.stringify(body.tags));
        }

        if (body.is_published === true) {
            finalUpdates.push('published_at = NOW()');
        }

        if (finalUpdates.length > 0) {
            finalValues.push(id);
            await query(`UPDATE content_items SET ${finalUpdates.join(', ')} WHERE id = ?`, finalValues);
        }

        return NextResponse.json({ success: true, message: 'Content updated' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug: id } = await params;
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes(session.role as string)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await query('UPDATE content_items SET is_published = 0 WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Content deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
