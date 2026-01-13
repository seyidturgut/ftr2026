import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { logoutSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (token) {
            // Remove from DB
            await query('DELETE FROM sessions WHERE session_token = ?', [token]);
        }

        // Clear Cookie
        await logoutSession();

        return NextResponse.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
