import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role as string) !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const counts: any = await query(`
            SELECT 
                (SELECT COUNT(*) FROM content_items) as total_content,
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM content_categories) as total_categories,
                (SELECT COALESCE(SUM(views), 0) FROM content_items) as total_views
        `);

        return NextResponse.json({
            success: true,
            stats: counts[0]
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
