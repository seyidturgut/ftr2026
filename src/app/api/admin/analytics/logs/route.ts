import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'fulladmin')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        // Build query
        let sql = `
            SELECT d.id, d.downloaded_at, d.ip_address, 
                   u.username, u.first_name, u.last_name,
                   c.title as content_title
            FROM download_logs d
            JOIN users u ON d.user_id = u.id
            JOIN content_items c ON d.content_id = c.id
        `;

        const params: any[] = [];

        if (search) {
            sql += ` WHERE u.username LIKE ? OR c.title LIKE ? OR d.ip_address LIKE ?`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY d.downloaded_at DESC LIMIT 100`;

        const logs = await query(sql, params);

        return NextResponse.json({
            success: true,
            logs
        });

    } catch (error) {
        console.error('Analytics Logs Error:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
