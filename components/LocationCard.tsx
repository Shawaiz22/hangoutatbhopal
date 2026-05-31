"use client";

import React, { useState } from "react";
import { CombinedPlace } from "@/types";
import { ReviewsPanel } from "./ReviewsPanel";
import { 
  MapPin, 
  Wallet, 
  Flame, 
  Map, 
  Navigation, 
  Car, 
  Footprints, 
  Bus, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  EyeOff, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  CloudSun,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationCardProps {
  place: CombinedPlace;
  isSaved: boolean;
  onSaveToggle: (place: CombinedPlace) => void;
  onRemove: (place: CombinedPlace) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  cafe: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  mall: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  park: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  monument: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  "street food": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  lake: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  default: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
};

export const LocationCard: React.FC<LocationCardProps> = ({
  place,
  isSaved,
  onSaveToggle,
  onRemove,
}) => {
  const { suggestion, details, commute, olaLink, googleMapsLink } = place;
  const [activeCommuteTab, setActiveCommuteTab] = useState<"driving" | "walking" | "transit">("driving");
  const [isCommuteOpen, setIsCommuteOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Normalize category for color coding
  const categoryKey = suggestion.category.toLowerCase().trim();
  const badgeStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.default;

  // Image source proxy resolver
  const photoReference = details?.photos?.[0]?.photo_reference;
  const imageUrl = photoReference
    ? `/api/places/photo?reference=${photoReference}`
    : `https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800`; // Fallback image

  // Vibe score circular progress configuration
  const vibeScore = suggestion.vibeScore || 85;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (vibeScore / 100) * circumference;

  const handleShare = async () => {
    const shareText = `I'm heading to ${suggestion.name} in Bhopal! 🏙️ Found via Hangout Bhopal #HangoutBhopal #Bhopal #GoogleCloud`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hangout Bhopal Recommender",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy share text:", err);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col h-full border-white/10"
    >
      {/* 1. TOP SECTION: Media & Badges */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={suggestion.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-transparent to-black/40" />

        {/* Category Badge (Top-Left) */}
        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} backdrop-blur-md`}>
          {suggestion.category}
        </span>

        {/* Vibe Score Ring (Top-Right) */}
        <div className="absolute top-4 right-4 flex items-center justify-center bg-[#0F0F1A]/80 border border-white/10 rounded-full p-1.5 backdrop-blur-md shadow-lg" title="Vibe Compatibility Score">
          <svg className="w-11 h-11 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-white/10 fill-none"
              strokeWidth="3.5"
            />
            {/* Progress Stroke */}
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-primary fill-none"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-white">
            {vibeScore}%
          </span>
        </div>

        {/* Floating title elements if needed */}
      </div>

      {/* 2. MIDDLE SECTION: Primary Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Place Title & Rating Row */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-extrabold text-white tracking-tight hover:text-primary transition-colors leading-snug">
              {suggestion.name}
            </h3>
            {/* Open/Closed Badge */}
            {details && details.open_now !== undefined && (
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border mt-1 shrink-0 ${
                details.open_now 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${details.open_now ? "bg-emerald-500" : "bg-red-500"}`} />
                {details.open_now ? "Open Now" : "Closed"}
              </span>
            )}
          </div>
          <p className="text-xs italic text-muted-text mt-0.5 font-medium leading-tight">
            {suggestion.tagline}
          </p>
        </div>

        {/* Rating and count */}
        {details && (details.rating || details.user_ratings_total) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-bold mb-3.5 bg-white/[0.02] border border-white/5 w-fit px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-[#FFE66D] fill-[#FFE66D]" />
            <span className="text-white font-extrabold">{details.rating || "N/A"}</span>
            <span className="text-white/40">•</span>
            <span>({details.user_ratings_total?.toLocaleString() || 0} reviews)</span>
          </div>
        )}

        {/* Why this fits current mood & weather */}
        <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
          <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Why you'll love it right now</span>
          </h4>
          <p className="text-xs text-white/95 leading-relaxed font-medium">
            {suggestion.why}
          </p>
        </div>

        {/* Quick parameters (Address, Budget, Must Try, Weather suitability) */}
        <div className="space-y-2.5 text-xs font-semibold text-muted-text mb-4 mt-auto">
          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
            <span className="text-white/80 leading-normal line-clamp-2">{details?.formatted_address || suggestion.address}</span>
          </div>

          {/* Estimated Budget */}
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white/80">Est. Spend: <strong className="text-white">{suggestion.estimatedBudget}</strong></span>
          </div>

          {/* Must Try */}
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent shrink-0" />
            <span className="text-white/80">Must Try: <strong className="text-accent">{suggestion.mustTry}</strong></span>
          </div>

          {/* Weather Suitability */}
          <div className="flex items-start gap-2">
            <CloudSun className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <span className="text-white/85 leading-normal">{suggestion.weatherSuitability}</span>
          </div>
        </div>

        {/* Collapsible Commute panel */}
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => setIsCommuteOpen(!isCommuteOpen)}
            className="flex items-center justify-between w-full text-xs font-bold text-white hover:text-primary transition-colors py-1.5 tap-target"
          >
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-secondary" />
              <span>Commute options from City Center</span>
            </span>
            {isCommuteOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence initial={false}>
            {isCommuteOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {commute ? (
                  <div className="py-2.5 space-y-3">
                    {/* Mode Tabs */}
                    <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                      <button
                        onClick={() => setActiveCommuteTab("driving")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all tap-target ${
                          activeCommuteTab === "driving"
                            ? "bg-primary text-white shadow-md"
                            : "text-muted-text hover:text-white"
                        }`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Drive</span>
                      </button>
                      <button
                        onClick={() => setActiveCommuteTab("walking")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all tap-target ${
                          activeCommuteTab === "walking"
                            ? "bg-primary text-white shadow-md"
                            : "text-muted-text hover:text-white"
                        }`}
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        <span>Walk</span>
                      </button>
                      <button
                        onClick={() => setActiveCommuteTab("transit")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all tap-target ${
                          activeCommuteTab === "transit"
                            ? "bg-primary text-white shadow-md"
                            : "text-muted-text hover:text-white"
                        }`}
                      >
                        <Bus className="w-3.5 h-3.5" />
                        <span>Bus</span>
                      </button>
                    </div>

                    {/* Tab contents */}
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-muted-text font-semibold">
                      {activeCommuteTab === "driving" && commute.driving && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-white">Duration: {commute.driving.duration}</span>
                            <span className="text-secondary">{commute.driving.distance}</span>
                          </div>
                          <p className="text-[10px] text-white/50 font-medium">Route: {commute.driving.summary}</p>
                        </div>
                      )}
                      {activeCommuteTab === "walking" && commute.walking && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-white">Duration: {commute.walking.duration}</span>
                            <span className="text-secondary">{commute.walking.distance}</span>
                          </div>
                          <p className="text-[10px] text-white/50 font-medium">Route: {commute.walking.summary}</p>
                        </div>
                      )}
                      {activeCommuteTab === "transit" && (
                        commute.transit ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-white">Duration: {commute.transit.duration}</span>
                              <span className="text-secondary">{commute.transit.distance}</span>
                            </div>
                            <p className="text-[10px] text-white/50 font-medium">Route: {commute.transit.summary}</p>
                          </div>
                        ) : (
                          <p className="text-center py-2 text-[10px] text-white/40">No direct bus routes available.</p>
                        )
                      )}
                    </div>

                    {/* Booking Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 tap-target text-center"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                      </a>
                      {olaLink && (
                        <a
                          href={olaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ffe66d] text-slate-900 hover:bg-[#ffe66d]/90 font-extrabold text-xs transition-all duration-300 tap-target text-center shadow-lg"
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>Book Ola</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="py-2 text-[10px] text-center text-white/30">Directions currently unavailable.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapsible Reviews panel */}
        <div className="border-t border-white/10 mt-3 pt-3">
          <button
            onClick={() => setIsReviewsOpen(!isReviewsOpen)}
            className="flex items-center justify-between w-full text-xs font-bold text-white hover:text-primary transition-colors py-1.5 tap-target"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#FFE66D] fill-[#FFE66D]" />
              <span>Top Google reviews</span>
            </span>
            {isReviewsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence initial={false}>
            {isReviewsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ReviewsPanel reviews={details?.reviews} googleMapsLink={googleMapsLink} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Actions (Save, Not this one, Share) */}
      <div className="p-4 bg-[#0A0A14] border-t border-white/5 flex gap-2 justify-between items-center">
        {/* Remove Button */}
        <button
          onClick={() => onRemove(place)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-text hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 tap-target flex items-center justify-center group"
          title="Not this one, hide it"
          aria-label="Hide spot"
        >
          <EyeOff className="w-4 h-4 group-hover:scale-105 transition-transform" />
        </button>

        <div className="flex gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 tap-target flex items-center gap-1.5 ${
              copied
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
            title="Share this spot"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Save/Unsave Button */}
          <button
            onClick={() => onSaveToggle(place)}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 tap-target flex items-center gap-1.5 ${
              isSaved
                ? "bg-primary text-white border-transparent shadow-[0_4px_12px_rgba(255,107,53,0.3)] hover:bg-primary/95"
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationCard;
