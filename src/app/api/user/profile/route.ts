import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/user/profile
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const users = await query(
            'SELECT id, username, first_name, last_name, title, email, profile_photo, role FROM users WHERE id = ?',
            [session.id]
        );

        if ((users as any[]).length === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: (users as any[])[0]
        });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/user/profile
export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { first_name, last_name, title, email, old_password, new_password } = body;

        // Şifre değişikliği varsa eski şifreyi kontrol et
        if (new_password) {
            if (!old_password) {
                return NextResponse.json({
                    success: false,
                    message: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz'
                }, { status: 400 });
            }

            // Kullanıcının mevcut şifresini al
            const users = await query(
                'SELECT password FROM users WHERE id = ?',
                [session.id]
            );

            if ((users as any[]).length === 0) {
                return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
            }

            const user = (users as any[])[0];
            const passwordMatch = await bcrypt.compare(old_password, user.password);

            if (!passwordMatch) {
                return NextResponse.json({
                    success: false,
                    message: 'Mevcut şifreniz yanlış'
                }, { status: 400 });
            }

            // Yeni şifreyi hashle ve güncelle
            const hashedPassword = await bcrypt.hash(new_password, 10);
            await query(
                'UPDATE users SET first_name = ?, last_name = ?, title = ?, email = ?, password = ? WHERE id = ?',
                [first_name, last_name, title || null, email, hashedPassword, session.id]
            );
        } else {
            // Sadece profil bilgilerini güncelle
            await query(
                'UPDATE users SET first_name = ?, last_name = ?, title = ?, email = ? WHERE id = ?',
                [first_name, last_name, title || null, email, session.id]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profil başarıyla güncellendi'
        });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
