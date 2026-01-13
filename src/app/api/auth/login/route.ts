import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import pool, { query } from '@/lib/db';
import { signToken, setSession } from '@/lib/auth';
import { User } from '@/types';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Get user
        const users = await query<any[]>('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
        const user = users[0];

        // Check password
        let isMatch = false;
        if (user.password.startsWith('$P$') || user.password.startsWith('$H$')) {
            // WordPress Hash (MD5/Phpass)
            const wpHash = require('wordpress-hash-node');
            isMatch = wpHash.CheckPassword(password, user.password);
        } else {
            // Standard BCrypt
            isMatch = await compare(password, user.password);
        }

        if (!user || !isMatch) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create session token (JWT)
        const tokenPayload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };
        const token = await signToken(tokenPayload);

        // Store in DB for legacy compatibility
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const userAgent = req.headers.get('user-agent') || '';
        // IP extraction in Next.js App router is tricky depending on proxy, but we can try headers
        const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

        await query(
            'INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
            [user.id, token, ipAddress, userAgent, expiresAt]
        );

        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Set Cookie
        await setSession(token);

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    title: user.title,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    profile_photo: user.profile_photo // Include this as frontend needs it
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
