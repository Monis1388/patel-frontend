"use client";
import React, { useEffect, useState } from 'react';
import { Package, User, FileText, Settings, Sparkles, LogOut, ArrowRight, Truck, X, RotateCcw, AlertCircle } from 'lucide-react';
import api, { BACKEND_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import OrderCard from '../../components/OrderCard';
import { motion, AnimatePresence } from 'framer-motion';

// Returns true if the order was delivered within the last 7 days
function isWithinReturnWindow(deliveredAt: string | null): boolean {
    if (!deliveredAt) return false;
    const diffMs = Date.now() - new Date(deliveredAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
}

export default function Profile() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [specsyAiEnabled, setSpecsyAiEnabled] = useState(true);
    const { updateUser } = useAuth();

    // Profile Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    // Return modal state
    const [returnOrder, setReturnOrder] = useState<any>(null);
    const [returnReason, setReturnReason] = useState('');
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            setName(user.name);
            setEmail(user.email);
            setSpecsyAiEnabled(user.specsyAiEnabled ?? true);
            fetchOrders();
        }
    }, [user, router]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
        } catch (error) {
            console.error(error);
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

    const updateProfileHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
        } else {
            try {
                const { data } = await api.put('/users/profile', { id: user?._id, name, email, password, specsyAiEnabled });
                setMessage('Profile Updated');
                updateUser(data);
                // Update local storage/context if needed
            } catch (error: any) {
                setMessage(error.response?.data?.message || 'Update failed');
            }
        }
    };

    const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('prescription', file);

        try {
            await api.post('/users/upload-prescription', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Prescription uploaded successfully!');
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 p-8 sticky top-24">
                    <div className="text-center mb-10 group">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#000042] to-primary rounded-[32px] rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-10" />
                            <div className="absolute inset-0 bg-white rounded-[32px] border-2 border-gray-50 flex items-center justify-center text-3xl text-[#000042] font-black shadow-inner">
                                {user?.name.charAt(0)}
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-[#000042] tracking-tighter uppercase">{user?.name}</h2>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full mt-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user?.role || 'Valued Member'}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => setActiveTab('orders')} 
                            className={`flex items-center justify-between w-full p-4 rounded-[24px] transition-all duration-300 group ${activeTab === 'orders' ? 'bg-[#000042] text-white shadow-xl shadow-[#000042]/20' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Package className={`w-5 h-5 ${activeTab === 'orders' ? 'text-white' : 'text-gray-400 group-hover:text-[#000042]'}`} />
                                <span className="text-xs font-black uppercase tracking-widest">My Purchase History</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeTab === 'orders' ? 'opacity-40' : 'opacity-0'}`} />
                        </button>

                        <button 
                            onClick={() => setActiveTab('profile')} 
                            className={`flex items-center justify-between w-full p-4 rounded-[24px] transition-all duration-300 group ${activeTab === 'profile' ? 'bg-[#000042] text-white shadow-xl shadow-[#000042]/20' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 group-hover:text-[#000042]'}`} />
                                <span className="text-xs font-black uppercase tracking-widest">Experience Settings</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeTab === 'profile' ? 'opacity-40' : 'opacity-0'}`} />
                        </button>

                        <button 
                            onClick={() => setActiveTab('prescription')} 
                            className={`flex items-center justify-between w-full p-4 rounded-[24px] transition-all duration-300 group ${activeTab === 'prescription' ? 'bg-[#000042] text-white shadow-xl shadow-[#000042]/20' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className={`w-5 h-5 ${activeTab === 'prescription' ? 'text-white' : 'text-gray-400 group-hover:text-[#000042]'}`} />
                                <span className="text-xs font-black uppercase tracking-widest">My Digitized Prescriptions</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeTab === 'prescription' ? 'opacity-40' : 'opacity-0'}`} />
                        </button>

                        <div className="h-[1px] bg-gray-100 my-6 mx-4" />

                        <button 
                            onClick={() => { logout(); router.push('/login'); }} 
                            className="flex items-center gap-3 w-full p-4 rounded-[24px] text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Secure Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
                {activeTab === 'orders' && (
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#000042] mb-8 ml-2">Purchase Timeline</h2>
                        {orders.length === 0 ? (
                            <div className="text-center p-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                                <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic opacity-60">Your timeline is currently empty</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
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

                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="card max-w-lg">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#000042] mb-6">Experience Settings</h2>
                        {message && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 text-xs font-bold uppercase tracking-widest border border-emerald-100 animate-in fade-in zoom-in">{message}</div>}
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-8 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 hover:border-primary/20 transition-all group">
                                <div className="flex-1 pr-8">
                                    <h4 className="text-lg font-black text-[#000042] uppercase tracking-tighter leading-none mb-2 group-hover:text-primary transition-colors">Specsy AI Assistant</h4>
                                    <p className="text-xs font-bold text-gray-400 italic leading-relaxed">Personalize your journey. Enable or disable the floating AI shopping guide anytime.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const newVal = !specsyAiEnabled;
                                        setSpecsyAiEnabled(newVal);
                                        try {
                                            const { data } = await api.put('/users/profile', { id: user?._id, specsyAiEnabled: newVal });
                                            updateUser(data);
                                            setMessage('AI Preference Updated');
                                            setTimeout(() => setMessage(''), 3000);
                                        } catch (error) {
                                            console.error(error);
                                            setSpecsyAiEnabled(!newVal);
                                        }
                                    }}
                                    className={`w-16 h-8 rounded-full transition-all relative flex items-center p-1 ${specsyAiEnabled ? 'bg-[#000042] shadow-2xl shadow-[#000042]/20' : 'bg-gray-200 shadow-inner'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md transform ${specsyAiEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            <div className="p-6 bg-[#000042]/5 rounded-[24px] border border-[#000042]/10">
                                <p className="text-[10px] font-black text-[#000042] uppercase tracking-[0.2em] text-center opacity-40 italic">Changes are calibrated and saved to your profile cloud instantly.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prescription' && (
                    <div className="card max-w-lg">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#000042] mb-6">My Digitized Prescriptions</h2>
                        
                        <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 hover:border-primary/20 transition-all group mb-8">
                            <label className="block text-lg font-black text-[#000042] uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                                Upload New Prescription
                            </label>
                            
                            <div className="relative">
                                <input 
                                    type="file" 
                                    onChange={handlePrescriptionUpload} 
                                    className="block w-full text-xs text-gray-400 font-bold italic
                                        file:mr-4 file:py-3 file:px-6
                                        file:rounded-2xl file:border-0
                                        file:text-[10px] file:font-black file:uppercase file:tracking-[0.1em]
                                        file:bg-[#000042]/5 file:text-[#000042]
                                        hover:file:bg-[#000042] hover:file:text-white
                                        file:transition-all file:cursor-pointer
                                        cursor-pointer
                                    "
                                />
                            </div>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <div className="p-1 px-3 bg-gray-50 rounded-full border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Standard Formats: JPG, PNG, PDF</p>
                                </div>
                            </div>
                        </div>

                        {user?.savedPrescriptions && user.savedPrescriptions.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#000042]/40 italic ml-4 mb-4">Vaulted Records</h3>
                                <div className="grid gap-3">
                                    {user.savedPrescriptions.map((path: string, i: number) => (
                                        <a 
                                            key={i}
                                            href={`http://localhost:5001/${path}`} 
                                            target="_blank" 
                                            className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-200 hover:border-primary/20 hover:bg-white hover:shadow-lg hover:shadow-black/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center border border-gray-100 text-[#000042] group-hover:text-primary transition-all shadow-sm group-hover:scale-105">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-[#000042] uppercase tracking-tighter">Digital Prescription</div>
                                                    <div className="text-[10px] font-bold text-gray-400 italic">Record #{i + 1} • {path.split('.').pop()?.toUpperCase()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#000042]/0 group-hover:text-primary group-hover:translate-x-0 translate-x-4 transition-all duration-300">View Scan</span>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
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
