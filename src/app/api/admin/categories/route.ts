import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !['fulladmin', 'admin'].includes((session as any).role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { name, slug, content_type, parent_id, display_order } = await req.json();

        if (!name || !slug) {
            return NextResponse.json({ success: false, message: 'İsim ve slug gereklidir.' }, { status: 400 });
        }

        const validPageTypes = ['akademik', 'dokuman', 'seminer'];
        let finalContentType = content_type || 'akademik';
        let finalPageType = finalContentType;

        if (!validPageTypes.includes(finalPageType)) {
            if (finalPageType.startsWith('dokuman')) finalPageType = 'dokuman';
            else finalPageType = 'akademik';
        }

        const result: any = await query(
            'INSERT INTO content_categories (name, slug, content_type, page_type, parent_id, display_order) VALUES (?, ?, ?, ?, ?, ?)',
            [name, slug, finalContentType, finalPageType, parent_id || null, display_order || 0]
        );

        return NextResponse.json({
            success: true,
            message: 'Kategori oluşturuldu.',
            id: result.insertId
        });
    } catch (error: any) {
        console.error('Category POST Error:', error);

        // Handle duplicate entry (slug)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return NextResponse.json({
                success: false,
                message: 'Bu kategori adresi (slug) zaten kullanımda. Lütfen farklı bir isim veya slug seçin.'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: error.message || 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
