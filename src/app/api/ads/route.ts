import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Ad } from '@/data/mockAds';

// GET /api/ads
export async function GET() {
    try {
        const sql = 'SELECT * FROM ads ORDER BY created_at DESC';
        const rows = await query<any[]>(sql);

        // Transform snake_case DB columns to camelCase JS objects if needed
        // Or keep matching the Ad interface. 
        // Our Ad interface uses: id, title, imageUrl, targetUrl, position, status, targetCategoryIds
        // DB uses: image_url, target_url, target_category_ids

        const ads: Ad[] = rows.map(row => ({
            id: row.id,
            title: row.title,
            imageUrl: row.image_url,
            targetUrl: row.target_url,
            position: row.position,
            status: row.status,
            targetCategoryIds: row.target_category_ids ? (typeof row.target_category_ids === 'string' ? JSON.parse(row.target_category_ids) : row.target_category_ids) : [],
            views: row.views,
            clicks: row.clicks
        }));

        return NextResponse.json(ads);
    } catch (error) {
        console.error('GET Ads Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/ads
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, title, imageUrl, targetUrl, position, status, targetCategoryIds } = body;

        const sql = `
            INSERT INTO ads (id, title, image_url, target_url, position, status, target_category_ids)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await query(sql, [
            id,
            title,
            imageUrl,
            targetUrl,
            position,
            status,
            JSON.stringify(targetCategoryIds || [])
        ]);

        return NextResponse.json({ success: true, message: 'Ad created' });
    } catch (error) {
        console.error('POST Ad Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
