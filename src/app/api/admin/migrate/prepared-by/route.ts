import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        await query(`
            ALTER TABLE content_items 
            ADD COLUMN prepared_by VARCHAR(255) NULL AFTER author_id;
        `);

        return NextResponse.json({
            success: true,
            message: 'prepared_by column added successfully'
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
