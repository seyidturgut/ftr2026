import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/users/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const canView = session.id === Number(id) || ['fulladmin', 'admin'].includes(session.role);
        if (!canView) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const users = await query<any[]>(
            'SELECT id, username, title, first_name, last_name, email, role, created_at, last_login, is_active FROM users WHERE id = ?',
            [id]
        );

        if (!users.length) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: users[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/users/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const canUpdateAll = session.role === 'fulladmin';
        const canUpdateOwn = session.id === Number(id);

        if (!canUpdateAll && !canUpdateOwn) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const updates: string[] = [];
        const values: any[] = [];

        const allowedFields = ['title', 'first_name', 'last_name', 'email'];
        if (canUpdateAll) {
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
            values.push(id);
            await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        return NextResponse.json({ success: true, message: 'User updated' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/users/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session || session.role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        if (session.id === Number(id)) {
            return NextResponse.json({ success: false, message: 'Cannot delete own account' }, { status: 400 });
        }

        const result = await query<any>('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
