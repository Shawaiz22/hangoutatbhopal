"use client";

import React from "react";

interface MapEmbedProps {
  query: string;
  name: string;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({ query, name }) => {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    query + " Bhopal"
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-white/10 bg-[#1A1A2E] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
      <iframe
        title={`Google Maps embed for ${name}`}
        width="100%"
        height="100%"
        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) grayscale(10%)" }} // Dark mode styling for maps!
        loading="lazy"
        allowFullScreen
        src={mapUrl}
        aria-label={`Interactive map showing ${name}`}
      />
    </div>
  );
};

export default MapEmbed;
