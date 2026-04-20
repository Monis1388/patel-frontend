"use client";
import React from 'react';
import { Package, CheckCircle2, RotateCcw, X, ArrowLeft, Truck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BACKEND_URL } from '../utils/api';

interface OrderCardProps {
    order: any;
    onCancel?: (id: string) => void;
    onReturn?: (order: any) => void;
    isReturnable?: boolean;
}

export default function OrderCard({ order, onCancel, onReturn, isReturnable }: OrderCardProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-[0_15px_50px_rgba(0,102,255,0.04)] border border-gray-50 hover:shadow-[0_40px_100px_rgba(0,102,255,0.08)] transition-all group relative overflow-hidden"
        >
            {/* Decorative Gradient Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[100px] -z-1" />

            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 mb-8 md:mb-12 pb-8 md:pb-10 border-b border-gray-50 relative">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1A1A2E] rounded-[24px] md:rounded-[28px] flex items-center justify-center shadow-xl shadow-[#1A1A2E]/20 group-hover:scale-110 transition-transform duration-500">
                        <Package className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1.5">Transaction Verified</div>
                        <div className="text-2xl md:text-3xl font-black italic text-[#1A1A2E] uppercase tracking-tighter">ORD-{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex flex-col items-center md:items-end px-6 py-2 border-none md:border-r md:border-gray-100">
                        <span className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Logged On</span>
                        <span className="text-xs md:text-sm font-black text-[#1A1A2E]">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                        </span>
                    </div>

                    {/* Order Status Badge */}
                    <div className={`px-8 py-3.5 md:px-10 md:py-4 rounded-2xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-3 shadow-lg ${order.orderStatus === 'Delivered' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                        order.orderStatus === 'Shipped' ? 'bg-[#4DA6FF] text-white shadow-blue-200' :
                        order.orderStatus === 'Return Approved' ? 'bg-purple-500 text-white shadow-purple-200' :
                        order.orderStatus === 'Refunded' ? 'bg-teal-500 text-white shadow-teal-200' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-500 text-white shadow-red-200' :
                        'bg-[#1A1A2E] text-white shadow-indigo-200'
                    }`}>
                        <CheckCircle2 className="w-4 h-4" />
                        {order.orderStatus === 'Processing' ? 'Confirmed' : order.orderStatus}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-12 relative">
                {/* Item Images Container */}
                <div className="flex -space-x-6 md:-space-x-8">
                    {order.orderItems.map((item: any, i: number) => (
                        <motion.div key={i} whileHover={{ y: -12, scale: 1.1, zIndex: 10 }} className="w-20 h-20 md:w-28 md:h-28 rounded-[28px] md:rounded-[36px] bg-[#F8FAFF] border-[4px] md:border-[6px] border-white shadow-2xl overflow-hidden flex-shrink-0 transition-all cursor-pointer">
                            <img src={item.image?.startsWith('/uploads/') ? `${BACKEND_URL}${item.image}` : item.image} className="w-full h-full object-contain p-3 md:p-4" alt={item.name} />
                        </motion.div>
                    ))}
                    {order.orderItems.length > 3 && (
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-[28px] md:rounded-[36px] bg-[#1A1A2E] border-[4px] md:border-[6px] border-white shadow-2xl flex items-center justify-center text-xs md:text-sm font-black text-white">
                            +{order.orderItems.length - 3}
                        </div>
                    )}
                </div>

                {/* Price + Actions Section */}
                <div className="w-full lg:w-auto text-center lg:text-right flex flex-col items-center lg:items-end gap-6 md:gap-8">
                    <div>
                        <span className="text-[10px] md:text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] block mb-2 text-center lg:text-right">Total Premium</span>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl md:text-6xl font-black italic text-[#1A1A2E] uppercase tracking-tighter leading-none">₹{order.totalPrice.toLocaleString()}</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{order.paymentMethod}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto lg:justify-end">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {order.trackingId ? (
                                <div className="flex items-center gap-3">
                                    <a
                                        href={`https://www.delhivery.com/track/package/${order.trackingId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-[#1A1A2E] text-white px-8 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black transition-all shadow-xl shadow-black/10 group/btn"
                                    >
                                        Live Track <Truck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    </a>
                                    <div className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 uppercase text-[9px] font-black tracking-widest text-[#1A1A2E]/40">
                                        AWB: {order.trackingId}
                                    </div>
                                </div>
                            ) : order.orderStatus === 'Shipped' && (
                                <div className="flex items-center gap-2 px-6 py-4.5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest">
                                    <Truck className="w-4 h-4" /> Logistics Preparing
                                </div>
                            )}

                            <Link href={`/orders/${order._id}`} className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#EAF4FF] text-[#4DA6FF] px-8 md:px-10 py-4.5 md:py-5 rounded-2xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#4DA6FF] hover:text-white transition-all border border-[#4DA6FF]/10 shadow-xl shadow-blue-500/10 group/btn-track">
                                Timeline <ArrowLeft className="w-4 h-4 rotate-180 group-hover/btn-track:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                            {/* ── Cancel Order Button ── */}
                            {(order.orderStatus === 'Confirmed' || order.orderStatus === 'Pending' || order.orderStatus === 'Processing' || order.orderStatus === 'CONFIRMED') && onCancel && (
                                <button
                                    onClick={() => onCancel(order._id)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-red-50 text-red-600 px-6 md:px-8 py-4.5 md:py-5 rounded-2xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-xl shadow-red-500/10 group/can"
                                >
                                    <X className="w-4 h-4 group-hover/can:scale-125 transition-transform" />
                                    Cancel
                                </button>
                            )}

                            {/* ── Request Return Button ── */}
                            {isReturnable && onReturn && (
                                <button
                                    onClick={() => onReturn(order)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-orange-50 text-orange-600 px-6 md:px-8 py-4.5 md:py-5 rounded-2xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all border border-orange-100 shadow-xl shadow-orange-500/10 group/ret"
                                >
                                    <RotateCcw className="w-4 h-4 group-hover/ret:rotate-180 transition-transform duration-500" />
                                    Return
                                </button>
                            )}
                        </div>

                        {/* Return tracking info */}
                        {order.returnStatus === 'Approved' && order.returnTrackingId && (
                            <div className="w-full md:w-auto flex items-center justify-center gap-3 bg-purple-50 text-purple-700 px-6 md:px-8 py-4.5 md:py-5 rounded-2xl md:rounded-[24px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-purple-100 shadow-lg shadow-purple-500/5">
                                <RotateCcw className="w-4 h-4" />
                                RETURN AWB: {order.returnTrackingId}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
