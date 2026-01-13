import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { name, slug, content_type, parent_id, display_order } = await req.json();

        await query(
            'UPDATE content_categories SET name = ?, slug = ?, content_type = ?, parent_id = ?, display_order = ? WHERE id = ?',
            [name, slug, content_type, parent_id || null, display_order || 0, id]
        );

        return NextResponse.json({ success: true, message: 'Kategori güncellendi.' });
    } catch (error) {
        console.error('Category PUT Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if there are content items in this category
        const items: any = await query('SELECT COUNT(*) as count FROM content_items WHERE category_id = ?', [id]);
        if (items[0].count > 0) {
            return NextResponse.json({
                success: false,
                message: 'Bu kategoride içerik bulunmaktadır. Önce içerikleri silmeli veya taşımalısınız.'
            }, { status: 400 });
        }

        // Check for subcategories
        const subs: any = await query('SELECT COUNT(*) as count FROM content_categories WHERE parent_id = ?', [id]);
        if (subs[0].count > 0) {
            return NextResponse.json({
                success: false,
                message: 'Bu kategorinin alt kategorileri bulunmaktadır. Önce onları silmelisiniz.'
            }, { status: 400 });
        }

        await query('DELETE FROM content_categories WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Kategori silindi.'
        });
    } catch (error) {
        console.error('Category DELETE Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
