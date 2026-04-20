"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api, { BACKEND_URL, cleanImageUrl } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, Home as HomeIcon, LayoutGrid, RotateCw, ShoppingBag, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import BannerCarousel from '../components/BannerCarousel';

function CategoryCard({ item, sectionTitle }: { item: any, sectionTitle: string }) {
  const [isError, setIsError] = React.useState(false);
  const imgSrc = cleanImageUrl(item.image);
  const isLocal = imgSrc?.includes('localhost') || imgSrc?.includes('127.0.0.1');

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link
        href={`/shop?category=${sectionTitle}&gender=${item.name}`}
        className="group flex flex-col items-center gap-2"
      >
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
          <Image
            src={isError ? "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80" : imgSrc} 
            alt={item.name} 
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized={isLocal}
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
            onError={() => setIsError(true)}
          />
          <div className="absolute top-2 left-2 text-[10px] font-black text-gray-900 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-md uppercase tracking-tighter">
            {item.name}
          </div>
          {item.priceText && (
            <div className="absolute bottom-0 left-0 bg-primary text-white px-2 py-0.5 rounded-tr-lg text-[8px] font-black italic">
              {item.priceText}
            </div>
          )}
        </div>
        <span className="text-sm font-bold text-gray-700 group-hover:text-primary">{item.name}</span>
      </Link>
    </motion.div>
  );
}

export default function Home({ 
  initialProducts = [], 
  initialBanners = [], 
  initialCategories = [] 
}: { 
  initialProducts?: any[], 
  initialBanners?: any[], 
  initialCategories?: any[] 
}) {
  const [products, setProducts] = React.useState(initialProducts);
  const [banners, setBanners] = React.useState(initialBanners);
  const [dbCategories, setDbCategories] = React.useState<any[]>(initialCategories);
  const [loading, setLoading] = React.useState(initialProducts.length === 0);

  React.useEffect(() => {
    // Only fetch if we don't have initial data
    if (initialProducts.length > 0 || initialBanners.length > 0 || initialCategories.length > 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [productsRes, bannersRes, categoriesRes] = await Promise.all([
          api.get('products'),
          api.get('banners'),
          api.get('categories')
        ]);
        setProducts(productsRes.data.products || []);
        setBanners(bannersRes.data || []);
        setDbCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialProducts, initialBanners, initialCategories]);

  const defaultTypes = ["Eyeglasses", "Sunglasses"];
  const dbTypes = Array.from(new Set(dbCategories.map(c => c.type)));
  const productTypes = Array.from(new Set(products.map(p => (p as any).category)));
  const allTypes = Array.from(new Set([...defaultTypes, ...dbTypes, ...productTypes])).filter(t => t !== "Contact Lenses");

  const sections = allTypes.map(type => {
    const items = dbCategories.filter(c => c.type === type);
    const hasDbItems = items.length > 0;
    
    // Default placeholders if database is empty for this type
    const fallbacks: Record<string, any[]> = {
      "Eyeglasses": [
        { name: "Men", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80" },
        { name: "Women", image: "https://images.unsplash.com/photo-1591010885068-07e110cb1624?w=800&q=80" },
        { name: "Kids", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80" },
        { name: "On Sale", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80", priceText: "Starts @₹500" }
      ],
      "Sunglasses": [
        { name: "Men", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80" },
        { name: "Women", image: "https://images.unsplash.com/photo-1544717297-fa15bdfca03c?w=800&q=80" },
        { name: "Kids", image: "https://images.unsplash.com/photo-1503910368127-b459492c5ae0?w=800&q=80" },
        { name: "On Sale", image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80", priceText: "Starts @₹500" }
      ]
    };

    if (!hasDbItems && !fallbacks[type]) return null;

    return {
      title: type,
      badge: type === "Eyeglasses" ? "with Power" : null,
      items: hasDbItems ? items : (fallbacks[type] || [])
    };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-8 pb-32 bg-[#FBFBFB]">
      {/* Hero Banner Section */}
      <section className="px-4 pt-4">
        {loading ? (
          <div className="h-[240px] md:h-[400px] bg-gray-200 rounded-3xl animate-pulse" />
        ) : (
          <BannerCarousel banners={banners} />
        )}
      </section>

      {/* Dynamic Category Sections */}
      {sections.map((section: any, sIdx: number) => (
        <motion.section 
          key={sIdx} 
          className="px-4 space-y-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: sIdx * 0.1 }}
        >
          <div className="flex items-center gap-3 ml-2">
            <h2 className="text-2xl font-black text-gray-900">{section.title}</h2>
            {section.badge && (
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">
                {section.badge}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {section.items.map((item: any, iIdx: number) => (
              <CategoryCard key={iIdx} item={item} sectionTitle={section.title} />
            ))}
          </div>
        </motion.section>
      ))}

      {/* Featured Collection Section */}
      <motion.section 
        className="px-4 space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between ml-2">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
            New Arrivals
          </h2>
          <Link href="/shop" className="text-primary font-bold text-sm">View All</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="min-w-[200px] h-64 bg-gray-100 rounded-3xl animate-pulse" />)
          ) : (
            products.slice(0, 6).map((product: any, idx: number) => (
              <motion.div 
                key={product._id} 
                className="min-w-[220px]"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

    </div>
  );
}
