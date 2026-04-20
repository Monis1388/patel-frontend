'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { BACKEND_URL } from '../../utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, ShoppingCart, ImageOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const WishlistPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const { data } = await api.get('users/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/wishlist');
            return;
        }
        fetchWishlist();
    }, [user, router]);

    const removeFromWishlist = async (id: string) => {
        try {
            await api.delete(`users/wishlist/${id}`);
            setWishlist(wishlist.filter(item => item._id !== id));
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const formatImageUrl = (img: string) => {
        if (!img) return '';
        return img.startsWith('/uploads/') ? `${BACKEND_URL}${img}` : img;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 md:space-y-12"
            >
                {/* Header */}
                <div className="text-center space-y-3 md:space-y-4">
                    <div className="flex items-center justify-center gap-2 md:gap-3 text-red-500 mb-1">
                        <Heart className="w-5 h-5 md:w-6 md:h-6 fill-red-500" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Your Selection</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                        The Wishlist
                    </h1>
                    <p className="text-gray-500 font-bold max-w-xl mx-auto text-xs md:text-sm px-4">
                        Curate your personal collection of precision masterpieces and statement pieces.
                    </p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-gray-50 rounded-[32px] md:rounded-[40px] p-10 md:p-20 text-center space-y-6 md:space-y-8 border border-dashed border-gray-200">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                            <Heart className="w-8 h-8 md:w-10 md:h-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Your Wishlist is Empty</h2>
                            <p className="text-gray-400 font-bold text-[11px] md:text-sm">You haven't saved any masterpieces yet.</p>
                        </div>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-3 bg-black text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/10"
                        >
                            Start Exploring <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <AnimatePresence mode='popLayout'>
                            {wishlist.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="group relative bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden">
                                        {item.image ? (
                                            <img
                                                src={formatImageUrl(item.image)}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-200">
                                                <ImageOff className="w-10 h-10" />
                                            </div>
                                        )}

                                        {/* Mobile-Friendly Actions (Visible on image corner for touch) */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                                            <button
                                                onClick={() => removeFromWishlist(item._id)}
                                                className="w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-lg border border-gray-100 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <Link
                                                href={`/product/${item._id}`}
                                                className="w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-900 shadow-lg border border-gray-100 hover:bg-primary hover:text-white transition-all active:scale-90 md:hidden"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>

                                        {/* Desktop-Only Hover Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-3">
                                            <Link
                                                href={`/product/${item._id}`}
                                                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 font-black shadow-2xl hover:bg-primary transition-all active:scale-90"
                                            >
                                                <ArrowRight className="w-6 h-6" />
                                            </Link>
                                        </div>

                                        {/* Brand Tag */}
                                        <div className="absolute top-2 left-2 md:top-4 md:left-4">
                                            <span className="bg-white/90 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest text-primary border border-white">
                                                {item.brand}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 md:p-8 space-y-2 md:space-y-4">
                                        <div className="space-y-0.5 md:space-y-1">
                                            <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</p>
                                            <h3 className="text-xs md:text-xl font-black uppercase italic tracking-tighter text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                                {item.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-50">
                                            <p className="text-sm md:text-2xl font-black text-gray-900 tracking-tighter">₹{item.price}</p>
                                            <Link
                                                href={`/product/${item._id}`}
                                                className="bg-gray-50 hover:bg-white hover:shadow-md p-2 md:p-3 rounded-lg md:rounded-xl border border-transparent hover:border-gray-100 transition-all group/cart"
                                            >
                                                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover/cart:text-primary transition-colors" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default WishlistPage;
