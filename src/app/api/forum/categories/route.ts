import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const sql = `
            SELECT fc.*, 
                   (SELECT COUNT(*) FROM forum_threads WHERE category_id = fc.id) as thread_count,
                   (SELECT COUNT(*) FROM forum_comments fm 
                    JOIN forum_threads ft ON fm.thread_id = ft.id 
                    WHERE ft.category_id = fc.id) as comment_count
            FROM forum_categories fc
            ORDER BY fc.display_order ASC
        `;
        const categories = await query(sql);

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Forum Categories GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
