"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizAnswers } from "@/types";
import { ArrowLeft, Sparkles } from "lucide-react";

interface MoodQuizProps {
  onSubmit: (answers: QuizAnswers) => void;
  isLoading: boolean;
}

const STEPS = [
  {
    id: "mood",
    question: "How are you feeling right now?",
    description: "Select a vibe that matches your mood.",
    options: [
      { value: "😴 Bored", label: "Bored", color: "from-pink-500 to-rose-500" },
      { value: "🥰 Romantic", label: "Romantic", color: "from-red-500 to-pink-500" },
      { value: "⚡ Adventurous", label: "Adventurous", color: "from-orange-500 to-amber-500" },
      { value: "😌 Chill", label: "Chill", color: "from-teal-500 to-emerald-500" },
      { value: "🍽️ Hungry", label: "Hungry", color: "from-yellow-500 to-orange-500" },
      { value: "🎉 Social", label: "Social", color: "from-indigo-500 to-purple-500" },
    ],
  },
  {
    id: "company",
    question: "Who are you going with?",
    description: "Choose your company for this hangout.",
    options: [
      { value: "🧍 Solo", label: "Solo", color: "from-blue-500 to-indigo-500" },
      { value: "👫 With a Date", label: "With a Date", color: "from-rose-400 to-red-500" },
      { value: "👯 Friends Group", label: "Friends Group", color: "from-emerald-400 to-teal-500" },
      { value: "👨‍👩‍👧 Family", label: "Family", color: "from-purple-400 to-violet-500" },
    ],
  },
  {
    id: "budget",
    question: "What's your budget?",
    description: "How much are you looking to spend?",
    options: [
      { value: "🆓 Free / No spend", label: "Free / No spend", color: "from-emerald-500 to-teal-500" },
      { value: "💸 Budget (under ₹300)", label: "Budget (under ₹300)", color: "from-cyan-500 to-blue-500" },
      { value: "💳 Moderate (₹300–800)", label: "Moderate (₹300–800)", color: "from-purple-500 to-indigo-500" },
      { value: "👑 Splurge (₹800+)", label: "Splurge (₹800+)", color: "from-amber-500 to-yellow-500" },
    ],
  },
  {
    id: "distance",
    question: "How far are you willing to go?",
    description: "Select your travel preferences.",
    options: [
      { value: "🏘️ Very Nearby (2km)", label: "Very Nearby (2km)", color: "from-teal-500 to-cyan-500" },
      { value: "🚗 Anywhere in Bhopal", label: "Anywhere in Bhopal", color: "from-orange-500 to-red-500" },
      { value: "🌄 Open to outskirts too", label: "Open to outskirts too", color: "from-indigo-500 to-purple-500" },
    ],
  },
];

export const MoodQuiz: React.FC<MoodQuizProps> = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const handleSelect = (value: string) => {
    const key = STEPS[currentStep].id as keyof QuizAnswers;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(newAnswers as QuizAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentQuizStep = STEPS[currentStep];
  const progressPercent = ((currentStep) / STEPS.length) * 100;

  // Slide transition configuration
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] py-12 px-6 text-center">
        {/* Animated Upper Lake & Raja Bhoj Statue Silhouette */}
        <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
          {/* Backdrop Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
          
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-white drop-shadow-[0_0_20px_rgba(78,205,196,0.3)]"
          >
            {/* Sun/Moon */}
            <circle cx="100" cy="90" r="35" fill="url(#sunGlow)" className="animate-pulse" />
            
            {/* Hills Backdrop */}
            <path
              d="M10 140 Q 50 110, 90 140 T 170 140 Q 185 130, 200 140 L 200 180 L 0 180 Z"
              fill="#1A1A2E"
            />
            
            {/* Raja Bhoj Statue Pedestal & Silhouette */}
            <g transform="translate(100, 115) scale(0.65)" fill="#0F0F1A" stroke="#FF6B35" strokeWidth="0.5">
              {/* Pedestal */}
              <path d="M -25,40 L 25,40 L 20,10 L -20,10 Z" fill="#0A0A14" />
              <rect x="-15" y="-5" width="30" height="15" fill="#0A0A14" />
              {/* Statue Figure holding sword */}
              {/* Crown/Head */}
              <circle cx="0" cy="-45" r="8" />
              <path d="M -5,-51 L 0,-62 L 5,-51 Z" />
              {/* Neck & Body */}
              <path d="M -4,-37 L 4,-37 L 6,-10 L -6,-10 Z" />
              {/* Cape / Robe */}
              <path d="M -15,-37 C -22,-20 -20,10 -15,10 L 15,10 C 20,10 22,-20 15,-37 Z" fill="#151528" opacity="0.8" />
              {/* Right Arm raised with sword */}
              <path d="M 4,-30 C 12,-35 15,-45 15,-50" fill="none" strokeWidth="4" strokeLinecap="round" />
              {/* Sword */}
              <path d="M 15,-50 L 15,-80 L 17,-80 L 17,-50 Z" fill="#FFE66D" stroke="#FFE66D" />
              <path d="M 10,-52 L 20,-52" strokeWidth="2" />
              {/* Left Arm on waist */}
              <path d="M -4,-30 C -10,-28 -12,-20 -8,-15" fill="none" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Lake Water Waves */}
            <path
              d="M0 155 Q 30 150, 60 155 T 120 155 T 180 155 T 200 155 L 200 200 L 0 200 Z"
              fill="#0F0F1A"
              opacity="0.9"
            />
            <path
              d="M0 168 Q 25 165, 50 168 T 100 168 T 150 168 T 200 168 L 200 200 L 0 200 Z"
              fill="#4ECDC4"
              opacity="0.3"
              className="animate-pulse"
            />
            <path
              d="M0 180 Q 35 178, 70 180 T 140 180 T 200 180 L 200 200 L 0 200 Z"
              fill="#FF6B35"
              opacity="0.15"
            />

            {/* Small sailboat */}
            <g transform="translate(40, 140) scale(0.25)" fill="#FFE66D" opacity="0.8">
              <path d="M 0,20 L 30,20 L 25,27 L 5,27 Z" />
              <path d="M 15,3 L 15,20 L 2,20 Z" />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#FFE66D" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center max-w-md"
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-lg mb-2">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Consulting city guides...</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Finding your perfect spot</h3>
          <p className="text-muted-text text-sm leading-relaxed px-4">
            Factoring in your current mood, company, weather details, and current local time to build custom Bhopal recommendations.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-white/5">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl text-muted-text hover:text-white hover:bg-white/5 transition-colors tap-target flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <span className="text-xs text-muted-text font-medium">
          {Math.round(progressPercent)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Question Slider */}
      <div className="min-h-[280px] flex flex-col justify-between">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
              {currentQuizStep.question}
            </h2>
            <p className="text-muted-text text-sm mb-6 font-medium">
              {currentQuizStep.description}
            </p>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto">
              {currentQuizStep.options.map((option) => {
                const isSelected = answers[currentQuizStep.id as keyof QuizAnswers] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`group relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 tap-target flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r " + option.color + " border-transparent text-white shadow-lg"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 text-white/90 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="font-semibold text-sm sm:text-base tracking-wide z-10">
                      {option.value}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-xs font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">
                      Select
                    </span>
                    {/* Hover subtle glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodQuiz;
