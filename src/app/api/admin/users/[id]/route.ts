import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { username, email, password, first_name, last_name, role, daily_download_limit, monthly_download_limit } = body;

        // Validation for uniqueness (excluding self)
        const existing = await query(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, id]
        ) as any[];

        if (existing.length > 0) {
            return NextResponse.json({ success: false, message: 'Username or Email already taken by another user' }, { status: 400 });
        }

        // Update Query Builder
        let sql = 'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, daily_download_limit = ?, monthly_download_limit = ?';
        let values = [username, email, first_name, last_name, role, daily_download_limit || 5, monthly_download_limit || 100];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password_hash = ?';
            values.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        values.push(id);

        await query(sql, values);

        return NextResponse.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Update User Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Don't allow deleting yourself
        if (id === (session as any).id.toString()) {
            return NextResponse.json({ success: false, message: 'Kendinizi silemezsiniz.' }, { status: 400 });
        }

        await query('DELETE FROM users WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Kullanıcı silindi.'
        });
    } catch (error) {
        console.error('User DELETE Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
