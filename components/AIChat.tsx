"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'ai';
    content: string;
    isFallback?: boolean;
}

interface AIChatResponse {
    reply: string;
    isFallback: boolean;
}

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    initialMessage?: string;
}

export default function AIChat({ isOpen, onClose, initialMessage }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && initialMessage && messages.length === 0) {
            handleSend(initialMessage);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = { role: 'user', content: messageText };
        setMessages((prev) => [...prev, userMessage]);
        
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post<AIChatResponse>('/ai/chat', { message: messageText });
            
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: data.reply,
                    isFallback: data.isFallback
                }
            ]);
        } catch (error) {
            console.error('AI Chat Error', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact support below."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="bg-white w-full max-w-lg h-[600px] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-[#000042] p-6 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase tracking-tighter italic text-lg leading-none">Specsy AI</h3>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Eyewear Expert</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gray-50/50">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-[#000042]" />
                                </div>
                                <div>
                                    <p className="font-black uppercase tracking-widest text-[#000042] text-xs">How can I help today?</p>
                                    <p className="text-gray-400 text-[11px] mt-1 max-w-[200px]">Ask about frame shapes, lens types, or style advice!</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 pt-4">
                                    {['Shipping?', 'Return Policy?', 'Prescription Help?', 'Track Order'].map(q => (
                                        <button
                                            key={q}
                                            onClick={() => handleSend(q)}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-[11px] font-black uppercase text-[#000042] hover:border-primary hover:text-primary transition-all shadow-sm"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#000042] text-white' : 'bg-white shadow-sm text-primary'}`}>
                                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#000042] text-white rounded-tr-none' : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-none'}`}>
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                        {i === messages.length - 1 && m.role === 'ai' && (
                                            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                                                <a
                                                    href="https://wa.me/919876543210"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-[10px] font-black uppercase text-center hover:bg-green-600 transition-all shadow-sm shadow-green-200"
                                                >
                                                    Talk to Human
                                                </a>
                                                <button
                                                    onClick={() => onClose()}
                                                    className="px-4 bg-gray-100 text-gray-500 py-2 rounded-xl text-[10px] font-black uppercase text-center hover:bg-gray-200 transition-all"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 bg-white shadow-sm rounded-xl flex items-center justify-center animate-pulse">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-white border-t border-gray-100">
                        <div className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend('')}
                                placeholder="Type your question..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-6 pr-14 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium"
                            />
                            <button
                                onClick={() => handleSend('')}
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#000042] text-white rounded-xl flex items-center justify-center hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
