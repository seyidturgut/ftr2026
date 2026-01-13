import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ success: false, message: 'Only images are allowed' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, message: 'File size must be less than 5MB' }, { status: 400 });
        }

        // Get old photo to delete it later
        const users = await query('SELECT profile_photo FROM users WHERE id = ?', [session.id]);
        const oldPhoto = (users as any[])[0]?.profile_photo;

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `profile_${session.id}_${Date.now()}.${file.type.split('/')[1]}`;
        const filepath = join(process.cwd(), 'public/uploads', filename);

        // Save new file
        await writeFile(filepath, buffer);

        // Update database
        await query('UPDATE users SET profile_photo = ? WHERE id = ?', [filename, session.id]);

        // Delete old photo if exists
        if (oldPhoto) {
            try {
                const oldFilepath = join(process.cwd(), 'public/uploads', oldPhoto);
                await unlink(oldFilepath);
            } catch (err) {
                console.error('Failed to delete old photo:', err);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            filename
        });
    } catch (error) {
        console.error('Profile photo upload error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
