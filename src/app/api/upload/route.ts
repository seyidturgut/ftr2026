import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'profile';

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Validation
        const allowedTypes: Record<string, string[]> = {
            profile: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            content_cover: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            ad_image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            pdf: ['application/pdf'],
            video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm']
        };

        if (!allowedTypes[type] || !allowedTypes[type].includes(file.type)) {
            if (!allowedTypes[type]?.includes(file.type)) {
                return NextResponse.json({ success: false, message: 'Invalid file type' }, { status: 400 });
            }
        }

        const maxSize = type === 'profile' ? 2 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ success: false, message: 'File too large' }, { status: 400 });
        }

        let buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public/uploads', `${type}s`);

        // Ensure dir exists
        await mkdir(uploadDir, { recursive: true });

        // Optimization Logic
        let filename: string;

        if (type === 'ad_image' || type === 'content_cover') {
            // Resize and convert to WebP with high quality
            const processedBuffer = await sharp(buffer)
                .resize({
                    width: type === 'content_cover' ? 1920 : 1200, // Higher res for covers
                    withoutEnlargement: true
                })
                .webp({ quality: 90 }) // 90% quality for better details
                .toBuffer();

            buffer = Buffer.from(processedBuffer);
            filename = `${type}_${session.id}_${randomUUID()}.webp`;
        } else {
            // Standard handling for other types
            const ext = path.extname(file.name) || (type === 'pdf' ? '.pdf' : '.jpg');
            filename = `${type}_${session.id}_${randomUUID()}${ext}`;
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${type}s/${filename}`;

        if (type === 'profile') {
            // Use environment variable for app URL or fallback to relative
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
            const fullUrl = appUrl ? `${appUrl}${fileUrl}` : fileUrl;
            await query('UPDATE users SET profile_photo = ? WHERE id = ?', [fileUrl, session.id]);
        }

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: fileUrl,
                filename: filename,
                type: type
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
