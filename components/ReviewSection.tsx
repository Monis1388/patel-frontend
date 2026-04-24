"use client";
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquare, Send, User } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface ReviewSectionProps {
    productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`reviews/${productId}`);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews', error);
        }
    };

    const checkEligibility = async () => {
        if (!user) {
            setCanReview(false);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get(`reviews/check-eligibility/${productId}`);
            setCanReview(data.canReview);
        } catch (error) {
            console.error('Error checking eligibility', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
            checkEligibility();
        }
    }, [productId, user]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('reviews', { rating, comment, productId });
            setComment('');
            setRating(5);
            fetchReviews();
            checkEligibility();
            alert('Review submitted successfully! Thank you for your feedback.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !reviews.length) return <div className="mt-12 animate-pulse h-20 bg-gray-50 rounded-2xl" />;

    return (
        <div className="mt-24 pt-24 border-t border-gray-100">
            <div className="max-w-4xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Customer Voice</h3>
                <h2 className="text-3xl font-black text-gray-900 mb-12 uppercase italic">Reviews & Feedback</h2>

                {/* Write Review Form */}
                {canReview && (
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-16 border-2 border-gray-50 shadow-2xl shadow-gray-100 transition-all hover:shadow-primary/5">
                        <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase italic">
                            <MessageSquare className="w-6 h-6 text-primary" />
                            Share Your Experience
                        </h4>
                        <form onSubmit={submitHandler} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${
                                                    star <= (hover || rating)
                                                        ? 'text-orange-400 fill-orange-400'
                                                        : 'text-gray-100'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Review</label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what you liked (or didn't) about the product..."
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-3xl p-6 h-40 focus:bg-white focus:border-primary outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-gray-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-gray-200"
                            >
                                {submitting ? 'Submitting...' : (
                                    <>
                                        Submit Review
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-12">
                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-[2.2rem] border-2 border-dashed border-gray-200 group transition-all hover:bg-white hover:border-primary/20">
                            <p className="text-gray-400 font-bold uppercase tracking-widest italic group-hover:text-primary/40 transition-colors">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="group">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-50 shadow-sm ring-8 ring-gray-50 transition-all group-hover:ring-primary/5 group-hover:border-primary/10">
                                            <User className="w-7 h-7 text-gray-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h5 className="font-black text-gray-900 uppercase italic tracking-tight">{review.name || review.user?.name}</h5>
                                                    {review.isVerified && (
                                                        <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                                            <CheckCircle className="w-2.5 h-2.5" />
                                                            Verified Purchase
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${
                                                            i < review.rating
                                                                ? 'text-orange-400 fill-orange-400'
                                                                : 'text-gray-200'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-4 top-0 w-1 h-full bg-gray-50 rounded-full group-hover:bg-primary/10 transition-colors" />
                                            <p className="text-gray-600 leading-relaxed font-medium text-lg italic pl-4">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
