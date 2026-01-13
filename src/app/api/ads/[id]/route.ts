import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT /api/ads/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // We only update fields that are present in the body
        // But for simplicity in this task, we can update specific fields like status or full edit

        const updates: string[] = [];
        const values: any[] = [];

        if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
        if (body.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(body.imageUrl); }
        if (body.targetUrl !== undefined) { updates.push('target_url = ?'); values.push(body.targetUrl); }
        if (body.position !== undefined) { updates.push('position = ?'); values.push(body.position); }
        if (body.status !== undefined) { updates.push('status = ?'); values.push(body.status); }
        if (body.targetCategoryIds !== undefined) {
            updates.push('target_category_ids = ?');
            values.push(JSON.stringify(body.targetCategoryIds));
        }

        // Stats updates
        if (body.views !== undefined) { updates.push('views = ?'); values.push(body.views); }
        if (body.clicks !== undefined) { updates.push('clicks = ?'); values.push(body.clicks); }

        if (updates.length === 0) {
            return NextResponse.json({ success: true, message: 'No updates provided' });
        }

        values.push(id);
        const sql = `UPDATE ads SET ${updates.join(', ')} WHERE id = ?`;

        await query(sql, values);

        return NextResponse.json({ success: true, message: 'Ad updated' });
    } catch (error) {
        console.error('PUT Ad Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/ads/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await query('DELETE FROM ads WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Ad deleted' });
    } catch (error) {
        console.error('DELETE Ad Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
