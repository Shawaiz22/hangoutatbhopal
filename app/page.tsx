"use client";

import React, { useState, useEffect } from "react";
import { WeatherInfo, QuizAnswers, CombinedPlace } from "@/types";
import { WeatherBadge } from "@/components/WeatherBadge";
import { MoodQuiz } from "@/components/MoodQuiz";
import { LocationCard } from "@/components/LocationCard";
import { MapEmbed } from "@/components/MapEmbed";
import { 
  Sparkles, 
  RotateCcw, 
  Bookmark, 
  Map, 
  Compass, 
  Trash2, 
  HelpCircle,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [places, setPlaces] = useState<CombinedPlace[]>([]);
  
  // Saved places state (persisted to localStorage)
  const [savedPlaces, setSavedPlaces] = useState<CombinedPlace[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  
  // Active place selection for Map preview
  const [activePlace, setActivePlace] = useState<CombinedPlace | null>(null);
  
  // Track hidden places ("Not this one")
  const [hiddenPlaceNames, setHiddenPlaceNames] = useState<string[]>([]);

  // 1. Fetch weather on mount
  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch (err) {
        console.error("Failed to load weather:", err);
      } finally {
        setWeatherLoading(false);
      }
    }
    loadWeather();
  }, []);

  // 2. Load saved spots from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("saved_hangouts");
    if (saved) {
      try {
        setSavedPlaces(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved places", e);
      }
    }
  }, []);

  // 3. Handle quiz submission
  const handleQuizSubmit = async (quizAnswers: QuizAnswers) => {
    setAnswers(quizAnswers);
    setLoadingSuggestions(true);
    setHiddenPlaceNames([]); // Reset hidden items on new quiz

    try {
      // Step A: Fetch suggestions from Gemini
      const suggestRes = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: quizAnswers,
          weather: weather || {
            temperature: 28,
            weathercode: 1,
            windspeed: 10,
            description: "Partly Cloudy",
            emoji: "⛅",
          },
        }),
      });

      if (!suggestRes.ok) throw new Error("Failed to get suggestions");
      const suggestionsData = await suggestRes.json();

      // Step B: Fetch full places and directions data
      const placesRes = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestions: suggestionsData }),
      });

      if (!placesRes.ok) throw new Error("Failed to get places details");
      const combinedData: CombinedPlace[] = await placesRes.json();

      setPlaces(combinedData);
      if (combinedData.length > 0) {
        setActivePlace(combinedData[0]);
      }
    } catch (err) {
      console.error("Error loading recommendation pipeline:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 4. Save/unsave toggle
  const handleSaveToggle = (place: CombinedPlace) => {
    const name = place.suggestion.name;
    const isAlreadySaved = savedPlaces.some((p) => p.suggestion.name === name);
    
    let updated: CombinedPlace[];
    if (isAlreadySaved) {
      updated = savedPlaces.filter((p) => p.suggestion.name !== name);
    } else {
      updated = [...savedPlaces, place];
    }
    
    setSavedPlaces(updated);
    localStorage.setItem("saved_hangouts", JSON.stringify(updated));
  };

  // 5. Hide spot
  const handleRemovePlace = (place: CombinedPlace) => {
    setHiddenPlaceNames((prev) => [...prev, place.suggestion.name]);
    // If active place is hidden, shift focus to another visible place
    if (activePlace?.suggestion.name === place.suggestion.name) {
      const visible = places.filter(
        (p) => p.suggestion.name !== place.suggestion.name && !hiddenPlaceNames.includes(p.suggestion.name)
      );
      setActivePlace(visible.length > 0 ? visible[0] : null);
    }
  };

  // 6. Reset hidden spots
  const handleResetHidden = () => {
    setHiddenPlaceNames([]);
    if (places.length > 0) {
      setActivePlace(places[0]);
    }
  };

  // 7. Reset quiz & results
  const handleResetQuiz = () => {
    setAnswers(null);
    setPlaces([]);
    setActivePlace(null);
    setHiddenPlaceNames([]);
  };

  // Filter out places that the user hid
  const visiblePlaces = places.filter((p) => !hiddenPlaceNames.includes(p.suggestion.name));

  return (
    <div className="min-h-screen flex flex-col glow-bg">
      {/* App Header */}
      <header className="sticky top-0 z-40 bg-[#0F0F1A]/80 backdrop-blur-md border-b border-white/10 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleResetQuiz}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-[0_4px_15px_rgba(255,107,53,0.3)]">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Hangout Bhopal
              </h1>
              <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider hidden sm:inline">
                Your AI-powered city companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Saved Spots Button */}
            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all tap-target flex items-center justify-center"
              title="Saved Places"
            >
              <Bookmark className="w-4 h-4 text-white" />
              {savedPlaces.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#0F0F1A]">
                  {savedPlaces.length}
                </span>
              )}
            </button>

            {/* Weather Badge */}
            <WeatherBadge weather={weather} loading={weatherLoading} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {/* STATE A: Quiz (not started or still loading suggestions) */}
          {(!answers || loadingSuggestions) && (
            <motion.div
              key="quiz-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center py-8"
            >
              {/* Intro Title */}
              {!loadingSuggestions && (
                <div className="text-center max-w-lg mb-8">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4 animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explore Bhopal Like Never Before</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
                    Bored in Bhopal?
                  </h2>
                  <p className="text-muted-text text-sm sm:text-base font-semibold leading-relaxed">
                    Take the 1-minute quiz and let AI select perfect cafes, lakeside spots, street food joints, or heritage sites for you right now.
                  </p>
                </div>
              )}

              <MoodQuiz onSubmit={handleQuizSubmit} isLoading={loadingSuggestions} />
            </motion.div>
          )}

          {/* STATE B: Suggestions loaded */}
          {answers && !loadingSuggestions && places.length > 0 && (
            <motion.div
              key="suggestions-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-6 lg:gap-8"
            >
              {/* Results Subheader */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-text mb-1 uppercase tracking-wider">
                    <span>Quiz Answers:</span>
                    <span className="text-secondary">{answers.mood}</span>
                    <span>•</span>
                    <span className="text-secondary">{answers.company}</span>
                    <span>•</span>
                    <span className="text-secondary">{answers.budget}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Your Tailored Hangout Spots
                  </h2>
                </div>

                <button
                  onClick={handleResetQuiz}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-extrabold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 tap-target shrink-0 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span>Start New Quiz</span>
                </button>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 items-start">
                
                {/* Left Side: Cards */}
                <div className="lg:col-span-8 space-y-6">
                  {visiblePlaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {visiblePlaces.map((place) => {
                        const isSelected = activePlace?.suggestion.name === place.suggestion.name;
                        return (
                          <div
                            key={place.suggestion.name}
                            onClick={() => setActivePlace(place)}
                            className={`cursor-pointer transition-all duration-300 ${
                              isSelected ? "ring-2 ring-primary rounded-3xl scale-[1.01]" : ""
                            }`}
                          >
                            <LocationCard
                              place={place}
                              isSaved={savedPlaces.some(
                                (sp) => sp.suggestion.name === place.suggestion.name
                              )}
                              onSaveToggle={handleSaveToggle}
                              onRemove={handleRemovePlace}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-4">
                      <HelpCircle className="w-12 h-12 text-muted-text/30" />
                      <h3 className="text-xl font-bold text-white">All suggestions hidden</h3>
                      <p className="text-sm text-muted-text max-w-sm">
                        You've rejected all recommended options. You can reset hidden spots to review them again.
                      </p>
                      <button
                        onClick={handleResetHidden}
                        className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs shadow-lg transition-colors tap-target"
                      >
                        Reset Hidden Spots
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Side: Map & Guide (Sticky Panel) */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                  {activePlace ? (
                    <motion.div
                      layoutId="active-map-panel"
                      className="glass-panel border-white/10 rounded-3xl p-5 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <Map className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                          Live Map Preview
                        </h3>
                      </div>

                      {/* Map Embed */}
                      <MapEmbed
                        query={activePlace.details?.formatted_address || activePlace.suggestion.name}
                        name={activePlace.suggestion.name}
                      />

                      <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs font-semibold">
                        <span className="text-primary text-[10px] font-black uppercase tracking-wider block mb-1">
                          Directions Location
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {activePlace.suggestion.name}
                        </h4>
                        <p className="text-muted-text mt-1 leading-normal font-medium">
                          {activePlace.details?.formatted_address || activePlace.suggestion.address}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="glass-panel border-white/5 rounded-3xl p-8 text-center text-muted-text text-sm">
                      Select a recommendation card on the left to show its map route and location coordinates.
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Saved Drawer Backdrop */}
      <AnimatePresence>
        {isSavedDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavedDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0F0F1A] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-black text-white">Saved Hangouts</h3>
                </div>
                <button
                  onClick={() => setIsSavedDrawerOpen(false)}
                  className="text-xs font-bold text-muted-text hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5 border border-white/5 tap-target"
                >
                  Close
                </button>
              </div>

              {savedPlaces.length > 0 ? (
                <div className="space-y-4">
                  {savedPlaces.map((place) => (
                    <div
                      key={place.suggestion.name}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-secondary">
                            {place.suggestion.category}
                          </span>
                          {place.details?.rating && (
                            <span className="flex items-center gap-0.5 text-[10px] text-white font-extrabold">
                              ★ {place.details.rating}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-white text-sm truncate">
                          {place.suggestion.name}
                        </h4>
                        <p className="text-[11px] text-muted-text line-clamp-1 mt-0.5">
                          {place.details?.formatted_address || place.suggestion.address}
                        </p>
                        <a
                          href={place.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-bold mt-2 tap-target"
                        >
                          Directions on Maps
                        </a>
                      </div>

                      {/* Action buttons inside drawer */}
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleSaveToggle(place)}
                          className="p-2 rounded-xl text-muted-text hover:text-red-400 hover:bg-red-500/10 transition-colors tap-target"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-text text-sm flex flex-col items-center gap-2">
                  <Bookmark className="w-8 h-8 text-white/10" />
                  <p>You haven't saved any spots yet.</p>
                  <p className="text-xs text-white/40 max-w-xs mt-1">
                    Click "Save" on recommendations cards to collect your favorite spots here.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#0A0A14] py-6 px-4 text-center">
        <p className="text-xs text-muted-text font-medium leading-relaxed">
          📍 Hangout Bhopal · An AI-powered hyperlocal city guide companion.
        </p>
        <p className="text-[10px] text-white/30 font-medium mt-1">
          Made for exploring Bhopal's lakes, heritage monuments, cafes, and street food. Powered by Google Cloud Gemini.
        </p>
      </footer>
    </div>
  );
}
