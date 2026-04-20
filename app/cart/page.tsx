"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Trash2, ArrowLeft, Plus,
    Minus, ChevronRight, Sparkles, ShieldCheck, Truck
} from 'lucide-react';
import api, { BACKEND_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const totalCartQuantity = React.useMemo(() => {
        return cartItems.reduce((acc, item: any) => acc + (item.qty || 0), 0);
    }, [cartItems]);

    const subtotal = React.useMemo(() => {
        return cartItems.reduce((acc, item: any) => acc + ((item.price || 0) * (item.qty || 0)), 0);
    }, [cartItems]);

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            fetchCart();
        } else {
            const guestCart = localStorage.getItem('cartItems');
            if (guestCart) {
                setCartItems(JSON.parse(guestCart));
            }
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await api.get('users/cart');
            setCartItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (id: string, qty: number) => {
        if (qty < 1) return;
        
        if (!user) {
            // Guest Update
            const updatedItems: any = cartItems.map((item: any) => 
                (item.productId || item.product._id) === id ? { ...item, qty } : item
            );
            setCartItems(updatedItems);
            localStorage.setItem('cartItems', JSON.stringify(updatedItems));
            return;
        }

        try {
            await api.post('users/cart', { productId: id, qty });
            fetchCart();
        } catch (error) {
            console.error(error);
        }
    }

    const removeFromCart = async (id: string) => {
        if (!user) {
            // Guest Remove
            const updatedItems = cartItems.filter((item: any) => (item.productId || item.product._id) !== id);
            setCartItems(updatedItems);
            localStorage.setItem('cartItems', JSON.stringify(updatedItems));
            return;
        }

        try {
            await api.delete(`users/cart/${id}`);
            fetchCart();
        } catch (error) {
            console.error(error);
        }
    }

    if (!isMounted) return null;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFB] py-6 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="flex flex-col">
                        <Link href="/shop" className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 hover:text-primary mb-2 flex items-center gap-2 transition-colors">
                            <ArrowLeft className="w-3 h-3" /> Continue Shopping
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Your Curated Bag</h1>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] md:rounded-[40px] p-10 md:p-20 flex flex-col items-center text-center border border-gray-100 shadow-2xl shadow-gray-200/50"
                    >
                        <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 text-gray-100 mb-6" />
                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">Bag is empty</h2>
                        <p className="text-gray-400 font-bold mb-8 uppercase text-[9px] md:text-[10px] tracking-widest leading-relaxed">Explore our latest optical collections</p>
                        <Link href="/shop" className="bg-black text-white h-14 md:h-16 px-10 md:px-12 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] flex items-center gap-3 hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/20">
                            Discover Eyewear <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4 md:space-y-6">
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item: any, idx: number) => {
                                    if (!item.product) return null;
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={item.product._id}
                                            className="bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 group"
                                        >
                                            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-center sm:items-start text-center sm:text-left">
                                                {/* Thumbnail */}
                                                <div className="w-full sm:w-40 md:w-48 aspect-video sm:aspect-[4/3] rounded-[20px] md:rounded-[24px] bg-gray-50 p-2 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative group/thumb">
                                                    <img
                                                        src={(item.image || item.product?.image || '/placeholder.png').startsWith('/uploads/') ? `${BACKEND_URL}${item.image || item.product.image}` : (item.image || item.product?.image || '/placeholder.png')}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                        alt={item.name || item.product?.name}
                                                    />
                                                    <div className="absolute top-3 right-3 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xl z-10 sm:hidden">
                                                        {item.qty}
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 space-y-3 min-w-0 w-full">
                                                    <div>
                                                        <Link href={`/product/${item.product._id}`} className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                                                            {item.name || item.product.name}
                                                        </Link>
                                                        <p className="text-xl md:text-2xl font-black text-blue-600 mt-1">₹{item.price.toLocaleString()}</p>
                                                    </div>

                                                    {item.lensPower && (
                                                        <div className="inline-block bg-blue-50/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-blue-100/50 text-left w-full sm:w-auto">
                                                            <div className="flex items-center gap-1.5 mb-2">
                                                                <span className="text-[9px] md:text-[10px] font-black uppercase text-blue-600 tracking-widest px-2 py-0.5 bg-blue-100 rounded-full">
                                                                    {typeof item.lensPower === 'string' ? item.lensPower : (item.lensPower.lensType || 'Custom Optics')}
                                                                </span>
                                                                <div className="h-1 w-1 rounded-full bg-blue-200" />
                                                                <span className="text-[8px] md:text-[10px] font-black uppercase text-gray-400">Optics Precision</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-1 md:gap-y-2">
                                                                {item.lensPower.od && (
                                                                    <div className="text-[9px] md:text-[10px] flex items-center gap-2">
                                                                        <span className="font-black text-gray-400 uppercase">OD:</span>
                                                                        <span className="font-black italic text-gray-900 truncate">{item.lensPower.od.sph || '0'}/{item.lensPower.od.cyl || '0'}/{item.lensPower.od.axis || '0'}</span>
                                                                    </div>
                                                                )}
                                                                {item.lensPower.os && (
                                                                    <div className="text-[9px] md:text-[10px] flex items-center gap-2">
                                                                        <span className="font-black text-gray-400 uppercase">OS:</span>
                                                                        <span className="font-black italic text-gray-900 truncate">{item.lensPower.os.sph || '0'}/{item.lensPower.os.cyl || '0'}/{item.lensPower.os.axis || '0'}</span>
                                                                    </div>
                                                                )}
                                                                {item.lensPower.pd && (
                                                                    <div className="text-[9px] md:text-[10px] col-span-2 flex items-center gap-2 border-t border-blue-100/50 pt-2 mt-1">
                                                                        <span className="font-black text-gray-400 uppercase">PD:</span>
                                                                        <span className="font-black italic text-gray-900">{item.lensPower.pd}mm</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-row sm:flex-col items-center gap-3 md:gap-6 mt-4 sm:mt-0">
                                                    <div className="flex items-center bg-gray-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl gap-2 border border-gray-100">
                                                        <button
                                                            onClick={() => updateQty(item.product._id, item.qty - 1)}
                                                            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:shadow-sm transition-all shadow-sm"
                                                        >
                                                            <Minus className="w-3 h-3 md:w-4 md:h-4" />
                                                        </button>
                                                        <span className="w-6 md:w-8 text-center font-black text-xs md:text-sm italic">{item.qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item.product._id, item.qty + 1)}
                                                            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:shadow-sm transition-all shadow-sm"
                                                        >
                                                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.product._id)}
                                                        className="w-11 h-11 md:w-14 md:h-14 bg-red-50 text-red-500 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group/trash shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5 group-hover/trash:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/80 backdrop-blur-xl border border-white rounded-[28px] md:rounded-[32px] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,102,255,0.05)] sticky top-24 relative overflow-hidden"
                            >
                                {/* Decorative Gradient Blobs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/50 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />

                                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-6 md:mb-8 flex items-center justify-between text-[#000042]">
                                    Summary
                                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                                </h2>

                                <div className="space-y-4 md:space-y-6 border-b border-gray-100 pb-6 md:pb-8 mb-6 md:mb-8">
                                    <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] items-center">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                                            <span>Total Units</span>
                                        </div>
                                        <span className="text-[#000042] font-black">{totalCartQuantity} items</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 mb-8 md:mb-10 relative">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Est. Subtotal</span>
                                    <div className="relative inline-block w-fit">
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-[#000042] block relative z-10"
                                        >
                                            ₹{subtotal.toLocaleString()}
                                        </motion.span>
                                        <div className="absolute bottom-1 left-2 w-full h-3 md:h-4 bg-blue-100/60 -skew-x-12 -z-0 rounded-sm" />
                                    </div>
                                </div>

                                <div className="space-y-4 md:space-y-5">
                                    <Link href="/checkout" className="group block">
                                        <button className="w-full h-16 md:h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[20px] md:rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] hover:shadow-[0_15px_30px_rgba(0,102,255,0.3)] hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden shadow-xl shadow-blue-500/10">
                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                            Checkout Now
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>

                                    <div className="flex items-center justify-center gap-3 py-1 md:py-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center"><ShieldCheck className="w-3 h-3 text-blue-500" /></div>
                                            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[7px] font-black text-blue-700 uppercase">SSL</div>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Secure Handshake</span>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50/40 rounded-[20px] md:rounded-3xl border border-blue-100/40 relative group cursor-default">
                                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
                                            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#000042]">Member Benefit</p>
                                    </div>
                                    <p className="text-[10px] md:text-xs font-bold leading-relaxed text-gray-500 italic opacity-80">Free premium hard-shell case & microfiber cleaning suite included.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
