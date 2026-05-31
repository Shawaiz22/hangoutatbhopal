"use client";

import React from "react";
import { GoogleReview } from "@/types";
import { Star, ExternalLink, MessageSquare } from "lucide-react";

interface ReviewsPanelProps {
  reviews?: GoogleReview[];
  googleMapsLink: string;
}

export const ReviewsPanel: React.FC<ReviewsPanelProps> = ({ reviews, googleMapsLink }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-4 text-center text-muted-text text-sm flex flex-col items-center justify-center gap-2">
        <MessageSquare className="w-5 h-5 text-white/20" />
        <span>No direct Google reviews found for this spot.</span>
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1 tap-target"
        >
          Check on Google Maps <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating ? "text-[#FFE66D] fill-[#FFE66D]" : "text-white/20"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4 py-3">
      <div className="space-y-3.5">
        {reviews.map((review, idx) => (
          <div 
            key={idx} 
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">
                  {review.author_name}
                </span>
                <span className="text-[10px] text-muted-text mt-0.5">
                  {review.relative_time_description}
                </span>
              </div>
              <div className="flex gap-0.5" aria-label={`Rating: ${review.rating} stars`}>
                {renderStars(review.rating)}
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-medium line-clamp-3">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center">
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 tap-target"
        >
          <span>Read all reviews on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default ReviewsPanel;
