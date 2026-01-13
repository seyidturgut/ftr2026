'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Clock, Eye, Download, FileText,
    Share2, Calendar, User, ChevronRight, Heart,
    CheckCircle, Home
} from 'lucide-react';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });
import { useAuth } from '@/context/AuthContext';

export default function ContentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (slug) {
            router.replace(`/content?slug=${slug}`);
        }
    }, [slug, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Yönlendiriliyorsunuz...</p>
        </div>
    );
}
