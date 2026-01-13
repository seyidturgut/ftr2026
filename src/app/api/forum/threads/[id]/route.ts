import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { id: threadId } = await context.params;

        // 1. Get thread detail
        const threadSql = `
            SELECT t.*, u.first_name, u.last_name, u.title as user_title, fc.name as category_name
            FROM forum_threads t
            JOIN users u ON t.user_id = u.id
            JOIN forum_categories fc ON t.category_id = fc.id
            WHERE t.id = ?
        `;
        const threadRows: any = await query(threadSql, [threadId]);

        if (threadRows.length === 0) {
            return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
        }

        const thread = threadRows[0];

        // Increment view count (fire and forget)
        query('UPDATE forum_threads SET views = views + 1 WHERE id = ?', [threadId]);

        // 2. Get comments
        const commentsSql = `
            SELECT c.*, u.first_name, u.last_name, u.title as user_title
            FROM forum_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.thread_id = ?
            ORDER BY c.created_at ASC
        `;
        const comments = await query(commentsSql, [threadId]);

        return NextResponse.json({
            success: true,
            data: {
                ...thread,
                comments
            }
        });
    } catch (error) {
        console.error('Forum Thread Detail GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
