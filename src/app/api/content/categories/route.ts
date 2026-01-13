import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/content/categories
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const content_type = searchParams.get('content_type');
        const parent_id = searchParams.get('parent_id');

        let sql = `
            SELECT cc.*, 
                   (
                       SELECT COUNT(*) 
                       FROM content_items ci 
                       WHERE ci.is_published = 1 AND (
                           ci.category_id = cc.id OR 
                           ci.category_id IN (SELECT id FROM content_categories sub WHERE sub.parent_id = cc.id)
                       )
                   ) as content_count,
                   (SELECT COUNT(*) FROM content_categories sub WHERE sub.parent_id = cc.id) as subcategory_count
            FROM content_categories cc
            WHERE 1=1
        `;

        const params: any[] = [];

        if (content_type) {
            sql += ' AND cc.content_type = ?';
            params.push(content_type);
        }

        if (parent_id === 'null') {
            sql += ' AND cc.parent_id IS NULL';
        } else if (parent_id) {
            sql += ' AND cc.parent_id = ?';
            params.push(parent_id);
        }

        sql += ' ORDER BY cc.display_order ASC, cc.name ASC';

        const categories = await query(sql, params);

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Categories GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}
