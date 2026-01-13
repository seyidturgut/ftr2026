import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const users = await query(`
            SELECT id, username, email, first_name, last_name, role, created_at, profile_photo, daily_download_limit, monthly_download_limit
            FROM users 
            ORDER BY created_at DESC
        `);

        return NextResponse.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Users API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'fulladmin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { username, email, password, first_name, last_name, role, daily_download_limit, monthly_download_limit } = body;

        // Basic validation
        if (!username || !email || !password || !first_name || !last_name) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Check availability
        const existing = await query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        ) as any[];

        if (existing.length > 0) {
            return NextResponse.json({ success: false, message: 'Username or Email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert
        await query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, role, daily_download_limit, monthly_download_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, first_name, last_name, role || 'editor', daily_download_limit || 5, monthly_download_limit || 100]
        );

        return NextResponse.json({
            success: true,
            message: 'User created successfully'
        });

    } catch (error) {
        console.error('Create User Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
