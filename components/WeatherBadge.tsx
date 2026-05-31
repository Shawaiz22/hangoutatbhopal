"use client";

import React from "react";
import { WeatherInfo } from "@/types";
import { CloudRain, Compass } from "lucide-react";

interface WeatherBadgeProps {
  weather: WeatherInfo | null;
  loading: boolean;
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card-bg/40 border border-white/5 animate-pulse text-xs text-muted-text">
        <div className="w-2.5 h-2.5 rounded-full bg-secondary/70 animate-ping" />
        <span>Syncing Bhopal Weather...</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card-bg/50 border border-white/5 text-xs text-[#FF6B35]">
        <CloudRain className="w-3.5 h-3.5" />
        <span>Bhopal, IN</span>
      </div>
    );
  }

  return (
    <div 
      className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-card-bg/80 border border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_20px_-2px_rgba(255,107,53,0.15)] cursor-pointer"
      title={`Windspeed: ${weather.windspeed} km/h`}
    >
      <span className="text-xl leading-none group-hover:scale-110 transition-transform duration-300">{weather.emoji}</span>
      <div className="flex flex-col text-left">
        <span className="text-sm font-bold text-white leading-none">{weather.temperature}°C</span>
        <span className="text-[10px] text-muted-text font-medium leading-tight mt-0.5 group-hover:text-secondary transition-colors">
          {weather.description}
        </span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />
    </div>
  );
};

export default WeatherBadge;
