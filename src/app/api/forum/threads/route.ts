import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('category_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let whereClause = '1=1';
        const queryParams: any[] = [];

        if (categoryId) {
            whereClause += ' AND t.category_id = ?';
            queryParams.push(categoryId);
        }

        const threadsSql = `
            SELECT t.*, u.first_name, u.last_name, u.title as user_title,
                   (SELECT COUNT(*) FROM forum_comments WHERE thread_id = t.id) as comment_count
            FROM forum_threads t
            JOIN users u ON t.user_id = u.id
            WHERE ${whereClause}
            ORDER BY t.is_pinned DESC, t.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const threads = await query(threadsSql, [...queryParams, limit, offset]);

        const countSql = `SELECT COUNT(*) as total FROM forum_threads t WHERE ${whereClause}`;
        const countResult = await query(countSql, queryParams);
        const total = countResult[0].total;

        return NextResponse.json({
            success: true,
            data: threads,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Forum Threads GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { category_id, title, content } = body;

        if (!category_id || !title || !content) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const result: any = await query(
            'INSERT INTO forum_threads (category_id, user_id, title, content) VALUES (?, ?, ?, ?)',
            [category_id, (session as any).id, title, content]
        );

        return NextResponse.json({
            success: true,
            message: 'Thread created',
            id: result.insertId
        });
    } catch (error) {
        console.error('Forum Thread POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
