import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'image', 'pdf', 'video', 'pptx'

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        // Validate file type based on 'type' parameter
        const allowedTypes: Record<string, string[]> = {
            'image': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            'pdf': ['application/pdf'],
            'video': ['video/mp4', 'video/webm', 'video/ogg'],
            'pptx': [
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.ms-powerpoint'
            ]
        };

        if (type && allowedTypes[type] && !allowedTypes[type].includes(file.type)) {
            return NextResponse.json({ success: false, message: `Invalid file type for ${type}` }, { status: 400 });
        }

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const extension = file.name.split('.').pop();
        const filename = `${type || 'content'}_${Date.now()}.${extension}`;
        const uploadDir = join(process.cwd(), 'public/uploads');

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) { }

        const filepath = join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            filename,
            url: `/uploads/${filename}`
        });
    } catch (error) {
        console.error('Content upload error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ success: false, message: 'No filename provided' }, { status: 400 });
        }

        // Basic security check: shouldn't be able to escape uploads dir
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({ success: false, message: 'Invalid filename' }, { status: 400 });
        }

        const { unlink } = require('fs/promises');
        const filepath = join(process.cwd(), 'public/uploads', filename);

        try {
            await unlink(filepath);
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            // If file doesn't exist, we still treat it as success or at least log it
            console.log(`File not found during delete: ${filename}`);
        }

        return NextResponse.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('File delete error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
