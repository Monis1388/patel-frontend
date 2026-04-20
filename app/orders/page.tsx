"use client";
import React, { useEffect, useState } from 'react';
import api, { BACKEND_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, ShoppingBag, Clock, CheckCircle2, ShoppingCart, RotateCcw, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import OrderCard from '../../components/OrderCard';

// Returns true if the order was delivered within the last 7 days
function isWithinReturnWindow(deliveredAt: string | null): boolean {
    if (!deliveredAt) return false;
    const diffMs = Date.now() - new Date(deliveredAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
}

export default function OrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Return modal state
    const [returnOrder, setReturnOrder] = useState<any>(null);
    const [returnReason, setReturnReason] = useState('');
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState('');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    useEffect(() => {
        if (!user) router.push('/login');
        else fetchOrders();
    }, [user, router]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnRequest = async () => {
        if (!returnReason.trim()) { setReturnError('Please select or enter a reason.'); return; }
        setReturning(true);
        setReturnError('');
        try {
            await api.put(`/orders/${returnOrder._id}/return-request`, { reason: returnReason });
            setReturnOrder(null);
            setReturnReason('');
            fetchOrders();
        } catch (err: any) {
            setReturnError(err.response?.data?.message || 'Return request failed.');
        } finally {
            setReturning(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be reversed.')) return;
        try {
            await api.put(`/orders/${orderId}/cancel`);
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFF] py-12 px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 sm:mb-16">
                    <motion.div variants={itemVariants}>
                        <Link href="/profile" className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-600 mb-3 flex items-center gap-2 transition-colors tracking-[0.2em]">
                            <ArrowLeft className="w-3 h-3" /> Secure Profile
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-[#1A1A2E] leading-tight">Order Repository</h1>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white px-6 sm:px-8 py-3 sm:py-4 rounded-[20px] sm:rounded-[24px] shadow-[0_10px_40px_rgba(0,102,255,0.05)] border border-gray-50 flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Archived</span>
                            <span className="text-lg font-black italic text-[#1A1A2E] leading-none">{orders.length} ITEMS</span>
                        </div>
                    </motion.div>
                </div>

                {orders.length === 0 ? (
                    <motion.div variants={itemVariants} className="bg-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-24 text-center shadow-[0_20px_60px_rgba(0,102,255,0.06)] border border-gray-50">
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 transition-all hover:scale-110">
                            <ShoppingCart className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#1A1A2E] mb-3">Your Bag is Empty</h2>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-10 max-w-[240px] mx-auto leading-relaxed">Precision optics await. Start your collection today.</p>
                        <Link href="/shop" className="bg-[#1A1A2E] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl shadow-[#1A1A2E]/20 active:scale-95">Discover Collection</Link>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:gap-10">
                        {orders.map((order: any) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onCancel={handleCancelOrder}
                                onReturn={(o) => { setReturnOrder(o); setReturnReason(''); setReturnError(''); }}
                                isReturnable={order.orderStatus === 'Delivered' && order.returnStatus === 'None' && isWithinReturnWindow(order.deliveredAt)}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ── Return Request Modal ── */}
            <AnimatePresence>
                {returnOrder && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setReturnOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">7-Day Return Window</div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1A1A2E]">Request Return</h2>
                                </div>
                                <button onClick={() => setReturnOrder(null)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order</p>
                            <p className="font-black text-[#1A1A2E] mb-6">ORD-{returnOrder._id.substring(returnOrder._id.length - 8)}</p>

                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Reason for Return</label>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {['Wrong size/fit', 'Damaged product', 'Not as described', 'Changed my mind'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setReturnReason(r)}
                                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${returnReason === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-orange-200'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                placeholder="Or describe your reason..."
                                rows={3}
                                value={returnReason}
                                onChange={e => setReturnReason(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-300 transition-all resize-none mb-4"
                            />

                            {returnError && (
                                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <AlertCircle className="w-4 h-4" /> {returnError}
                                </div>
                            )}

                            <button
                                onClick={handleReturnRequest}
                                disabled={returning}
                                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {returning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                {returning ? 'Submitting...' : 'Submit Return Request'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
