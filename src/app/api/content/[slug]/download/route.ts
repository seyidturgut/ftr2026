import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug: identifier } = await params;
        const { type } = await req.json().catch(() => ({ type: 'standard' }));

        const column = type === 'reference' ? 'reference_downloads' : 'downloads';

        // If identifier is a number, assume it's an ID, otherwise assume slug
        if (/^\d+$/.test(identifier)) {
            await query(`UPDATE content_items SET ${column} = ${column} + 1 WHERE id = ?`, [identifier]);
        } else {
            await query(`UPDATE content_items SET ${column} = ${column} + 1 WHERE slug = ?`, [identifier]);
        }

        return NextResponse.json({ success: true, message: 'Download count incremented' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
