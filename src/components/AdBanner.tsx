'use client';

import React from 'react';
import { useAds } from '@/context/AdContext';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
    position: 'sidebar' | 'inline' | 'header';
    className?: string;
    categoryIds?: number[];
}

const AdBanner: React.FC<AdBannerProps> = ({ position, className = '', categoryIds }) => {
    // Fetch ads from context based on position and current category targeting
    const { getAdsByPosition } = useAds();
    const availableAds = getAdsByPosition(position, categoryIds);

    if (availableAds.length === 0) return null;

    // Pick a random ad from the available pool
    const ad = availableAds[Math.floor(Math.random() * availableAds.length)];

    // Dimensions mapping
    const getDimensions = () => {
        switch (position) {
            case 'header': return 'w-full max-w-[728px] h-[90px] ml-auto'; // Right aligned
            case 'sidebar': return 'w-full max-w-[320px] h-[250px] mx-auto'; // Centered
            case 'inline': return 'w-full max-w-[728px] h-[90px] mx-auto'; // Centered
        }
    };

    return (
        <div className={`group relative overflow-hidden rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all ${getDimensions()} ${className}`}>
            <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full">
                <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider rounded z-10">
                    Sponsorlu
                </div>
                <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                    <div className="bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        İncele <ExternalLink size={10} />
                    </div>
                </div>
            </a>
        </div>
    );
};

export default AdBanner;
