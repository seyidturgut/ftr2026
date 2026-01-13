import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Optionally verify with DB to ensure session is not revoked/deleted
        // const dbSession = await query('SELECT * FROM sessions WHERE session_token = ?', [cookieStore.get('auth_token')?.value]);
        // if (!dbSession.length) ...

        // Fetch fresh user data including last_login
        const users = await query<any[]>('SELECT id, username, title, first_name, last_name, role, profile_photo, last_login FROM users WHERE id = ?', [session.id]);
        const user = users[0];

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 401 }
            );
        }

        // Update last_login on every verify (visit) to keep it fresh
        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        return NextResponse.json({
            success: true,
            data: {
                user: user,
            },
        });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
