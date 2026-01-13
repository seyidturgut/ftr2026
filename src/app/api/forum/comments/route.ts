import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { thread_id, content } = body;

        if (!thread_id || !content) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const result: any = await query(
            'INSERT INTO forum_comments (thread_id, user_id, content) VALUES (?, ?, ?)',
            [thread_id, (session as any).id, content]
        );

        return NextResponse.json({
            success: true,
            message: 'Comment added',
            id: result.insertId
        });
    } catch (error) {
        console.error('Forum Comment POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
