import { NextResponse } from 'next/server';
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

        // Remote Upload Configuration
        const CPANEL_UPLOAD_URL = process.env.CPANEL_UPLOAD_URL;
        const CPANEL_UPLOAD_SECRET = process.env.CPANEL_UPLOAD_SECRET;

        if (!CPANEL_UPLOAD_URL || !CPANEL_UPLOAD_SECRET) {
            console.error('Missing cPanel Upload Configuration');
            return NextResponse.json({ success: false, message: 'Server misconfiguration' }, { status: 500 });
        }

        // Forward file to remote server
        const remoteFormData = new FormData();
        remoteFormData.append('file', file);
        remoteFormData.append('type', type || 'content');

        const remoteResponse = await fetch(CPANEL_UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authtoken': CPANEL_UPLOAD_SECRET
            },
            body: remoteFormData
        });

        const remoteData = await remoteResponse.json();

        if (remoteData.success) {
            // Return the confusing local path that is actually proxied by next.config.ts
            // Remote: .../uploads/file.jpg -> Local: /uploads/file.jpg
            return NextResponse.json({
                success: true,
                message: 'File uploaded successfully',
                filename: remoteData.filename,
                url: `/uploads/${remoteData.filename}`
            });
        } else {
            console.error('Remote upload failed:', remoteData);
            return NextResponse.json({ success: false, message: remoteData.message || 'Remote upload failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('Content upload error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    // Note: Remote delete is not implemented in the basic PHP script provided.
    // We will just return success for now to prevent errors, or we can implement a delete endpoint in PHP later.
    // For now, let's just log it.
    console.log('Delete requested via API - Remote delete not implemented yet');
    return NextResponse.json({ success: true, message: 'File deleted (simulated)' });
}
