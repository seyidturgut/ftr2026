import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS ads (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url TEXT NOT NULL,
                target_url TEXT NOT NULL,
                position ENUM('sidebar', 'inline', 'header') NOT NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                target_category_ids JSON,
                views INT DEFAULT 0,
                clicks INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        await query(sql);

        return NextResponse.json({
            success: true,
            message: 'Ads table created successfully or already exists.'
        });
    } catch (error) {
        console.error('Setup Ads Table Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create ads table',
            error: String(error)
        }, { status: 500 });
    }
}
