import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        await query(`
            ALTER TABLE content_items 
            ADD COLUMN reference_pdf_url VARCHAR(255) NULL AFTER pdf_url;
        `);

        return NextResponse.json({
            success: true,
            message: 'reference_pdf_url column added successfully'
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
