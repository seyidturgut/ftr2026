import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { SessionPayload } from '@/types';

const SECRET_KEY = process.env.JWT_SECRET || 'secret';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as unknown as SessionPayload;
    } catch (error) {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function setSession(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });
}

export async function logoutSession() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
}
