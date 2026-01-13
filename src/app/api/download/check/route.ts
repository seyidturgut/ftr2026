import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'İndirme yapabilmek için giriş yapmalısınız.' }, { status: 401 });
        }

        const body = await req.json();
        const { content_id } = body;

        // 1. Get User Limits
        const user = (await query('SELECT daily_download_limit, monthly_download_limit FROM users WHERE id = ?', [session.id]) as any[])[0];

        if (!user) {
            return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        const dailyLimit = user.daily_download_limit || 5;
        const monthlyLimit = user.monthly_download_limit || 100;

        // 2. Count Today's Downloads
        const todayCount = (await query(`
            SELECT COUNT(*) as count 
            FROM download_logs 
            WHERE user_id = ? AND DATE(downloaded_at) = CURDATE()
        `, [session.id]) as any[])[0].count;

        if (todayCount >= dailyLimit) {
            return NextResponse.json({
                success: false,
                message: `Günlük indirme limitiniz doldu. (${dailyLimit}/${dailyLimit})`
            }, { status: 403 });
        }

        // 3. Count Month's Downloads
        const monthCount = (await query(`
            SELECT COUNT(*) as count 
            FROM download_logs 
            WHERE user_id = ? AND DATE_FORMAT(downloaded_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
        `, [session.id]) as any[])[0].count;

        if (monthCount >= monthlyLimit) {
            return NextResponse.json({
                success: false,
                message: `Aylık indirme limitiniz doldu. (${monthlyLimit}/${monthlyLimit})`
            }, { status: 403 });
        }

        // 4. Log the download (if check passed)
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        await query('INSERT INTO download_logs (user_id, content_id, ip_address) VALUES (?, ?, ?)', [session.id, content_id, ip]);

        return NextResponse.json({
            success: true,
            remainingDaily: dailyLimit - (todayCount + 1),
            remainingMonthly: monthlyLimit - (monthCount + 1)
        });

    } catch (error) {
        console.error('Download Check Error:', error);
        return NextResponse.json({ success: false, message: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
