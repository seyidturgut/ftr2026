export interface User {
    id: number;
    username: string;
    title?: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_photo?: string;
    email?: string;
    last_login?: string;
}

export interface ContentItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    content_type: 'pdf' | 'video' | 'text' | 'pptx';
    category_id: number;
    category_name: string;
    category_slug: string;
    cover_image?: string;
    pdf_url?: string;
    video_url?: string;
    pptx_url?: string;
    reference_pdf_url?: string;
    requires_auth: boolean;
    views: number;
    downloads: number;
    created_at: string;
    breadcrumbs?: any[];
}

export interface SessionPayload {
    id: number;
    username: string;
    role: string;
    [key: string]: any;
}
