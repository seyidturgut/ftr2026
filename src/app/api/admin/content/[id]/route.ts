import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin', 'editor'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();

        // Check if content exists
        const existing = await query('SELECT id FROM content_items WHERE id = ?', [id]);
        if ((existing as any[]).length === 0) {
            return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });
        }

        // Prepare update query
        const allowedFields = [
            'category_id', 'title', 'meta_title', 'slug', 'description', 'content_type',
            'pdf_url', 'pdf_pages', 'pdf_file_size', 'pptx_url', 'reference_pdf_url',
            'video_url', 'video_duration', 'video_thumbnail', 'video_platform',
            'text_content', 'cover_image', 'requires_auth', 'display_order',
            'tags', 'meta_description', 'has_download', 'is_published', 'content_order', 'prepared_by'
        ];

        let sql = 'UPDATE content_items SET ';
        const updateParams = [];
        const updates = [];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                const val = (field === 'content_order') ? JSON.stringify(body[field]) : body[field];
                updateParams.push(val);
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
        }

        // Special handling for published_at
        if (body.is_published === true) {
            updates.push('published_at = ?');
            updateParams.push(new Date());
        } else if (body.is_published === false) {
            updates.push('published_at = NULL');
        }

        sql += updates.join(', ') + ' WHERE id = ?';
        updateParams.push(id);

        await query(sql, updateParams);

        return NextResponse.json({ success: true, message: 'Content updated successfully' });
    } catch (error) {
        console.error('Content PUT error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        await query('DELETE FROM content_items WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Content DELETE error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
