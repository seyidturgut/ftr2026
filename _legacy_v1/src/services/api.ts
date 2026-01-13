// API Service - Axios instance and API calls

import axios, { AxiosInstance } from 'axios';
import type { AuthResponse, User, Document, Category, APIResponse } from '../types';

// MAMP default port is 8888, change if different
// Use environment variable or fallback
// MAMP default port is 8888, change if different
// Use environment variable or fallback
// Should point to the root where /uploads is located.
// If API is at /api/routes, uploads are at /api/uploads usually? No, uploads are usually at root or /uploads if served by PHP.
// PHP script upload.php saves to ../../uploads/. So if script is at api/routes/upload.php, it goes to api/uploads/.
// So FILE_BASE_URL should point to /api.
const API_BASE_URL = '/api/routes';
// Reverting to absolute URL to ensure images load reliably regardless of proxy state.
export const IMAGE_BASE_URL = 'http://localhost:8000';
// Use relative URL for documents (PDFs) to utilize Vite Proxy and bypass CORS.
export const DOC_BASE_URL = '';
// Legacy export for backward compatibility (defaults to IMAGE for safety)
export const FILE_BASE_URL = IMAGE_BASE_URL;

class APIService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to include auth token
        this.api.interceptors.request.use((config) => {
            // Check both localStorage and sessionStorage for token
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // Also send as custom header (Apache fallback)
                config.headers['X-Auth-Token'] = token;
            }
            return config;
        });
    }

    // =====================
    // Authentication
    // =====================
    async login(username: string, password: string): Promise<AuthResponse> {
        const response = await this.api.post('/auth.php/login', { username, password });
        return response.data;
    }

    async logout(): Promise<void> {
        await this.api.post('/auth.php/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    async verifyToken(): Promise<APIResponse<{ user: User }>> {
        const response = await this.api.get('/auth.php/verify');
        return response.data;
    }

    // =====================
    // Users
    // =====================
    async getUsers(): Promise<APIResponse<User[]>> {
        const response = await this.api.get('/users.php');
        return response.data;
    }

    async getUser(id: number): Promise<APIResponse<User>> {
        const response = await this.api.get(`/users.php/${id}`);
        return response.data;
    }

    async createUser(userData: Partial<User> & { password: string }): Promise<APIResponse<{ id: number }>> {
        const response = await this.api.post('/users.php', userData);
        return response.data;
    }

    async updateUser(id: number, userData: Partial<User>): Promise<APIResponse<void>> {
        const response = await this.api.put(`/users.php/${id}`, userData);
        return response.data;
    }

    async deleteUser(id: number): Promise<APIResponse<void>> {
        const response = await this.api.delete(`/users.php/${id}`);
        return response.data;
    }

    // =====================
    // Documents
    // =====================
    async getDocuments(): Promise<APIResponse<Document[]>> {
        const response = await this.api.get('/documents.php');
        return response.data;
    }

    async getDocument(id: number): Promise<APIResponse<Document>> {
        const response = await this.api.get(`/documents.php/${id}`);
        return response.data;
    }

    async getCategories(): Promise<APIResponse<Category[]>> {
        const response = await this.api.get('/documents.php/categories');
        return response.data;
    }

    async createDocument(docData: Partial<Document>): Promise<APIResponse<{ id: number }>> {
        const response = await this.api.post('/documents.php', docData);
        return response.data;
    }

    async updateDocument(id: number, docData: Partial<Document>): Promise<APIResponse<void>> {
        const response = await this.api.put(`/documents.php/${id}`, docData);
        return response.data;
    }

    async deleteDocument(id: number): Promise<APIResponse<void>> {
        const response = await this.api.delete(`/documents.php/${id}`);
        return response.data;
    }

    // =====================
    // Content Categories
    // =====================
    async getContentCategories(pageType?: 'akademik' | 'dokuman' | 'seminer'): Promise<APIResponse<any[]>> {
        const params = pageType ? `?page_type=${pageType}` : '';
        const response = await this.api.get(`/categories.php${params}`);
        return response.data;
    }

    async getContentCategory(id: number): Promise<APIResponse<any>> {
        const response = await this.api.get(`/categories.php/${id}`);
        return response.data;
    }

    async createContentCategory(categoryData: any): Promise<APIResponse<{ id: number }>> {
        const response = await this.api.post('/categories.php', categoryData);
        return response.data;
    }

    async updateContentCategory(id: number, categoryData: any): Promise<APIResponse<void>> {
        const response = await this.api.put(`/categories.php/${id}`, categoryData);
        return response.data;
    }

    async deleteContentCategory(id: number): Promise<APIResponse<void>> {
        const response = await this.api.delete(`/categories.php/${id}`);
        return response.data;
    }

    // =====================
    // Content Items
    // =====================
    async getContentItems(params?: { category_id?: number; content_type?: string }): Promise<APIResponse<any[]>> {
        const queryParams = new URLSearchParams();
        if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
        if (params?.content_type) queryParams.append('content_type', params.content_type);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await this.api.get(`/content.php${queryString}`);
        return response.data;
    }

    async getContentItem(slug: string): Promise<APIResponse<any>> {
        const response = await this.api.get(`/content.php/${slug}`);
        return response.data;
    }

    async createContent(contentData: any): Promise<APIResponse<{ id: number }>> {
        const response = await this.api.post('/content.php', contentData);
        return response.data;
    }

    async updateContent(id: number, contentData: any): Promise<APIResponse<void>> {
        const response = await this.api.put(`/content.php/${id}`, contentData);
        return response.data;
    }

    async deleteContent(id: number): Promise<APIResponse<void>> {
        const response = await this.api.delete(`/content.php/${id}`);
        return response.data;
    }

    async incrementDownload(id: number): Promise<APIResponse<void>> {
        const response = await this.api.post(`/content.php/${id}/download`);
        return response.data;
    }

    // =====================
    // File Upload
    // =====================
    async uploadFile(fileOrFormData: File | FormData, type?: 'profile' | 'content_cover' | 'pdf' | 'video'): Promise<APIResponse<any>> {
        let formData: FormData;

        if (fileOrFormData instanceof FormData) {
            formData = fileOrFormData;
        } else {
            formData = new FormData();
            formData.append('file', fileOrFormData);
            if (type) formData.append('type', type);
        }

        const response = await this.api.post('/upload.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async getProfile(): Promise<APIResponse<any>> {
        const response = await this.api.get('/profile.php');
        return response.data;
    }
}

export const api = new APIService();
