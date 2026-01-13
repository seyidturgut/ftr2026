import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'fulladmin')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const todayCounts = (await query(`
            SELECT COUNT(*) as count 
            FROM download_logs 
            WHERE DATE(downloaded_at) = CURDATE()
        `) as any[])[0].count;

        const monthCounts = (await query(`
            SELECT COUNT(*) as count 
            FROM download_logs 
            WHERE DATE_FORMAT(downloaded_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
        `) as any[])[0].count;

        const topContent = await query(`
            SELECT c.title, COUNT(*) as count
            FROM download_logs d
            JOIN content_items c ON d.content_id = c.id
            GROUP BY d.content_id
            ORDER BY count DESC
            LIMIT 5
        `);

        return NextResponse.json({
            success: true,
            today: todayCounts,
            month: monthCounts,
            topContent
        });
    } catch (error) {
        console.error('Analytics Stats Error:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
