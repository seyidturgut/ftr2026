export interface Ad {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl: string;
    position: 'sidebar' | 'inline' | 'header';
    targetCategoryIds?: number[];
    status: 'active' | 'inactive';
    views: number;
    clicks: number;
}

export const initialAds: Ad[] = [
    {
        id: '1',
        title: 'Örnek İlaç Reklamı',
        imageUrl: 'https://placehold.co/600x400/2563eb/ffffff?text=Reklam+1',
        targetUrl: 'https://example.com',
        position: 'sidebar',
        targetCategoryIds: [101, 102], // Sample category IDs
        status: 'active',
        views: 1250,
        clicks: 45
    },
    {
        id: '2',
        title: 'Medikal Cihaz Kampanyası',
        imageUrl: 'https://placehold.co/800x200/10b981/ffffff?text=Banner+Reklam',
        targetUrl: 'https://example.com',
        position: 'inline',
        status: 'active',
        views: 3400,
        clicks: 120
    },
    {
        id: '3',
        title: 'Header Sponsor',
        imageUrl: 'https://placehold.co/728x90/purple/white?text=Header+Reklam+Alani',
        targetUrl: 'https://example.com',
        position: 'header',
        status: 'active',
        views: 5000,
        clicks: 250
    }
];
