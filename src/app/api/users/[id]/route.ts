import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SessionPayload } from '@/types';

/**
 * Type guard to narrow the session object and ensure 
 * it contains required fields with correct types.
 */
function isValidSession(session: unknown): session is SessionPayload {
    if (!session || typeof session !== 'object') return false;
    const s = session as Record<string, unknown>;
    return (
        typeof s.id === 'number' &&
        typeof s.role === 'string' &&
        typeof s.username === 'string'
    );
}

// GET /api/users/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();

        // 1. Strict Session Validation
        if (!isValidSession(session)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number(id);
        const userRole = session.role;

        // 2. Authorization Logic
        const isAdmin = ['fulladmin', 'admin'].includes(userRole);
        const isSelf = session.id === userId;

        if (!isAdmin && !isSelf) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        // 3. Database Query
        const users = await query<any[]>(
            'SELECT id, username, title, first_name, last_name, email, role, created_at, last_login, is_active FROM users WHERE id = ?',
            [userId]
        );

        if (!users.length) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('User GET Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/users/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();

        if (!isValidSession(session)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number(id);
        const userRole = session.role;

        const isFullAdmin = userRole === 'fulladmin';
        const isSelf = session.id === userId;

        if (!isFullAdmin && !isSelf) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const updates: string[] = [];
        const values: any[] = [];

        // Define fields based on role
        const allowedFields = ['title', 'first_name', 'last_name', 'email'];
        if (isFullAdmin) {
            allowedFields.push('role', 'is_active');
        }

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(body[field]);
            }
        });

        if (body.password) {
            updates.push('password = ?');
            values.push(await hash(body.password, 10));
        }

        if (updates.length > 0) {
            values.push(userId);
            await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        return NextResponse.json({ success: true, message: 'User updated' });
    } catch (error) {
        console.error('User PUT Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/users/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();

        if (!isValidSession(session) || session.role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const userId = Number(id);
        if (session.id === userId) {
            return NextResponse.json({ success: false, message: 'Cannot delete own account' }, { status: 400 });
        }

        const result = await query<any>('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('User DELETE Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
