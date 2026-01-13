'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialAds, Ad } from '@/data/mockAds';

interface AdContextType {
    ads: Ad[];
    addAd: (ad: Ad) => void;
    updateAd: (id: string, updates: Partial<Ad>) => void;
    deleteAd: (id: string) => void;
    getAdsByPosition: (position: Ad['position'], categoryIds?: number[]) => Ad[];
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    // Load ads from API
    const fetchAds = async () => {
        try {
            const res = await fetch('/api/ads');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAds(data);
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            // Fallback to initialAds if API fails (optional, good for dev)
            if (ads.length === 0) setAds(initialAds);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const addAd = async (ad: Ad) => {
        // Optimistic update
        setAds(prev => [...prev, ad]);

        try {
            await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ad)
            });
            // Background refresh to ensure sync
            // fetchAds(); 
        } catch (error) {
            console.error('Failed to add ad:', error);
            // Revert on error would be ideal
        }
    };

    const updateAd = async (id: string, updates: Partial<Ad>) => {
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad));

        try {
            await fetch(`/api/ads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Failed to update ad:', error);
        }
    };

    const deleteAd = async (id: string) => {
        setAds(prev => prev.filter(ad => ad.id !== id));

        try {
            await fetch(`/api/ads/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to delete ad:', error);
        }
    };

    const getAdsByPosition = (position: Ad['position'], categoryIds?: number[]) => {
        // 1. Filter active ads for this position
        const activeAds = ads.filter(ad => ad.position === position && ad.status === 'active');

        // 2. Split into Targeted vs Generic
        // Check if any of the ad's target categories match any of the provided content categories (e.g. parent or current)
        const targetedAds = activeAds.filter(ad => {
            if (!categoryIds || categoryIds.length === 0 || !ad.targetCategoryIds || ad.targetCategoryIds.length === 0) return false;
            return ad.targetCategoryIds.some(targetId =>
                categoryIds.some(catId => Number(targetId) === Number(catId))
            );
        });

        const genericAds = activeAds.filter(ad =>
            !ad.targetCategoryIds || ad.targetCategoryIds.length === 0
        );

        // 3. Return prioritized pool
        // If targeted exist, return them. Else generic.
        return targetedAds.length > 0 ? targetedAds : genericAds;
    };


    return (
        <AdContext.Provider value={{ ads, addAd, updateAd, deleteAd, getAdsByPosition }}>
            {children}
        </AdContext.Provider>
    );
};

export const useAds = () => {
    const context = useContext(AdContext);
    if (!context) {
        throw new Error('useAds must be used within an AdProvider');
    }
    return context;
};
