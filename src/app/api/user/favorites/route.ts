import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const favorites: any = await query(
            'SELECT c.*, cat.name as category_name FROM content_items c ' +
            'JOIN user_favorites f ON c.id = f.content_id ' +
            'LEFT JOIN content_categories cat ON c.category_id = cat.id ' +
            'WHERE f.user_id = ?',
            [session.id]
        );

        return NextResponse.json({ success: true, data: favorites });
    } catch (error) {
        console.error('Favorites GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { content_id } = await req.json();

        await query(
            'INSERT IGNORE INTO user_favorites (user_id, content_id) VALUES (?, ?)',
            [session.id, content_id]
        );

        return NextResponse.json({ success: true, message: 'Added to favorites' });
    } catch (error) {
        console.error('Favorites POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const content_id = searchParams.get('content_id');

        await query(
            'DELETE FROM user_favorites WHERE user_id = ? AND content_id = ?',
            [session.id, content_id]
        );

        return NextResponse.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        console.error('Favorites DELETE error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
