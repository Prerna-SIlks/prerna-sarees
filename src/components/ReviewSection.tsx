"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, Send, Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  customer_name: string;
  user_id?: string;
}

export function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const supabase = createClient();

  const fetchReviews = useCallback(async (currentUserId?: string) => {
    setLoading(true);
    if (currentUserId) {
      // Check if user has purchased the product
      const { data: purchaseData } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', currentUserId)
        .limit(1)
        .maybeSingle();
      
      setHasPurchased(!!purchaseData);
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data as Review[]);
      if (currentUserId) {
        // use .maybeSingle() logic for review check as requested
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('user_id', currentUserId)
          .maybeSingle();
          
        if (existingReview) {
          setUserReview(existingReview as Review);
        } else {
          setUserReview(null);
        }
      }
    }
    setLoading(false);
  }, [productId, supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let currentUserId = undefined;
      if (authUser) {
        currentUserId = authUser.id;
        const email = authUser.email || "";
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.first_name || email.split('@')[0] || "Guest",
          email: email
        });
      }
      fetchReviews(currentUserId);
    };
    init();
  }, [supabase, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    const textLength = reviewText.trim().length;
    if (textLength < 10) {
      toast.error("Review must be at least 10 characters long.");
      return;
    }
    if (textLength > 500) {
      toast.error("Review cannot exceed 500 characters.");
      return;
    }

    setIsSubmitting(true);
    
    if (isEditing && userReview) {
      const { error } = await supabase.from('reviews').update({
        rating,
        review_text: reviewText.trim()
      }).eq('id', userReview.id);

      if (error) {
        toast.error("Failed to update review.");
      } else {
        toast.success("Review updated successfully!");
        setIsEditing(false);
        fetchReviews(user.id);
      }
    } else {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        customer_name: user.name,
        rating,
        review_text: reviewText.trim()
      });

      if (error) {
        toast.error("Failed to submit review. You may have already reviewed this product.");
      } else {
        toast.success("Thank you for your review!");
        fetchReviews(user.id);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleEditClick = () => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setRating(0);
    setReviewText("");
  };

  const formatDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays === 1) return "1 day ago";
    if (diffDays > 30) return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${diffDays} days ago`;
  };

  const isAdmin = user?.email === 'prernasilks@gmail.com';

  return (
    <div className="mt-16 border-t border-[#C9A84C]/20 pt-16">
      <h2 className="text-2xl font-serif text-[#1A0A0A] mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Write a Review */}
        {isAdmin ? null : (
          <div className="bg-white p-8 rounded-xl border border-[#C9A84C]/20 shadow-sm h-fit">
            <h3 className="text-lg font-serif font-bold text-[#6B1D1D] mb-4">
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h3>
            
            {user ? (
              !hasPurchased ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-sm text-[#6B1D1D] mb-4">Only customers who have purchased this product can write a review</p>
                </div>
              ) : !isEditing && userReview ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-[#1A0A0A] text-sm">You have already reviewed this product</h4>
                    <Button variant="outline" size="sm" onClick={handleEditClick} className="text-xs h-8">
                      <Edit className="h-3 w-3 mr-1.5" /> Edit Review
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4 w-4 ${userReview.rating >= star ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{userReview.review_text}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`h-6 w-6 ${(hoverRating || rating) >= star ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 resize-none text-sm"
                      placeholder="Share your experience with this saree..."
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Minimum 10 characters</p>
                      <p className="text-xs text-gray-500">{reviewText.length}/500 characters</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
                      className={`bg-[#6B1D1D] hover:bg-[#6B1D1D]/90 text-white font-bold tracking-widest uppercase text-xs h-12 ${isEditing ? 'flex-1' : 'w-full'} disabled:opacity-50`}
                    >
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Review</>}
                    </Button>
                  </div>
                </form>
              )
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Login to review</p>
                <Link 
                  href={`/login?returnUrl=/products/${productId}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-[#C9A84C] bg-transparent shadow-sm hover:bg-[#C9A84C] hover:text-white h-9 px-4 py-2 text-[#C9A84C]"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Display Reviews */}
        <div className={isAdmin ? "col-span-1 md:col-span-2" : ""}>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-[#C9A84C] animate-spin" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100">
              <p>Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${rev.rating >= star ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatDaysAgo(rev.created_at)}
                    </span>
                  </div>
                  <h4 className="font-medium text-[#1A0A0A] text-sm mb-2">{rev.customer_name.split(' ')[0]}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{rev.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
