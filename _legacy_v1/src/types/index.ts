// TypeScript interfaces for API responses and data models

export interface User {
    id: number;
    username: string;
    title?: string;
    first_name: string;
    last_name: string;
    email?: string;
    role: 'fulladmin' | 'admin' | 'editor' | 'viewer';
    created_at: string;
    last_login?: string;
    is_active: boolean;
    profile_photo?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: User;
    };
}

export interface Document {
    id: number;
    title: string;
    description?: string;
    file_type: string;
    file_path?: string;
    file_size?: number;
    category_id?: number;
    category_name?: string;
    category_slug?: string;
    uploaded_by: number;
    first_name: string;
    last_name: string;
    title_uploader?: string;
    created_at: string;
    updated_at: string;
    downloads: number;
    is_active: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    created_at: string;
}

export interface APIResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// CMS Types
export interface ContentCategory {
    id: number;
    parent_id?: number;
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    display_order: number;
    page_type: 'akademik' | 'dokuman';
    created_by?: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    content_count?: number;
    first_name?: string;
    last_name?: string;
    user_title?: string;
}

export interface ContentItem {
    id: number;
    category_id: number;
    title: string;
    slug: string;
    description?: string;
    content_type: 'pdf' | 'video' | 'text';

    // PDF fields
    pdf_url?: string;
    pdf_pages?: number;
    pdf_file_size?: number;

    // Video fields
    video_url?: string;
    video_duration?: number;
    video_thumbnail?: string;
    video_platform?: string;

    // Text fields
    text_content?: string;

    // Common fields
    author_id?: number;
    views: number;
    downloads: number;
    requires_auth: boolean;
    display_order: number;
    tags?: string[];
    meta_description?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    is_published: boolean;

    // Related data
    category_name?: string;
    category_slug?: string;
    page_type?: string;
    first_name?: string;
    last_name?: string;
    author_title?: string;
}
