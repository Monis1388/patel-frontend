import React from 'react';
import HomeContent from './HomeContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getHomeData() {
    try {
        const [productsRes, bannersRes, categoriesRes] = await Promise.all([
            fetch(`${API_URL}/api/products`, { cache: 'no-store' }),
            fetch(`${API_URL}/api/banners`, { cache: 'no-store' }),
            fetch(`${API_URL}/api/categories`, { cache: 'no-store' })
        ]);

        const productsData = await productsRes.json();
        const bannersData = await bannersRes.json();
        const categoriesData = await categoriesRes.json();

        return {
            products: productsData.products || [],
            banners: bannersData || [],
            categories: categoriesData || []
        };
    } catch (error) {
        console.error('Error fetching SSR data:', error);
        return { products: [], banners: [], categories: [] };
    }
}

export default async function HomePage() {
    const { products, banners, categories } = await getHomeData();
    
    return (
        <HomeContent 
            initialProducts={products} 
            initialBanners={banners} 
            initialCategories={categories} 
        />
    );
}
