import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/users
export async function GET() {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes(session.role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const users = await query(
            'SELECT id, username, title, first_name, last_name, email, role, created_at, last_login, is_active FROM users ORDER BY created_at DESC'
        );

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/users
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { username, password, first_name, last_name, role, title, email, is_active } = body;

        // Validate
        if (!username || !password || !first_name || !last_name || !role) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const allowedRoles = ['fulladmin', 'admin', 'editor', 'viewer'];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
        }

        // Check existing
        const existing = await query('SELECT id FROM users WHERE username = ?', [username]);
        if ((existing as any[]).length > 0) {
            return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 409 });
        }

        // Create
        const hashedPassword = await hash(password, 10);
        const result = await query<any>(
            'INSERT INTO users (username, password, title, first_name, last_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, title, first_name, last_name, email, role, is_active ?? true]
        );

        return NextResponse.json({ success: true, message: 'User created', data: { id: result.insertId } }, { status: 201 });
    } catch (error) {
        console.error('Users POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
