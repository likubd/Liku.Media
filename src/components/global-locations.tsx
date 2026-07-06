"use client";

import React from "react";

const locations = [
  { country: "United States", address: "16 Cove Road, Mount Arlington, NJ 07856" },
  { country: "Australia", address: "155 Bennett Rd, St Clair NSW 2759" },
  { country: "South Africa", address: "55 Mons Rd, Bellevue East, Johannesburg, 2198" },
  { country: "Singapore", address: "6 Raffles Blvd, Marina Square" },
  { country: "Italy", address: "Via Bari, 9, 03043 Cassino, FR" },
  { country: "Dubai", address: "AlFattan Downtown - 32d St - Al Satwa" },
  { country: "Cyprus", address: "Estias 5, Strovolos 2001" },
  { country: "Bangladesh", address: "Ventura Iconia, Plot 37 Road No. 11, Banani, Dhaka 1213" },
];

export default function GlobalLocations() {
  return (
    <div className="relative w-full overflow-hidden bg-black text-white py-24 sm:py-32 border-t border-white/5">
      {/* Background Starry Space Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.12),transparent_60%)] pointer-events-none" />

      {/* Giant Rotating Textured Earth Sphere */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] md:w-[1000px] md:h-[1000px] rounded-full overflow-hidden pointer-events-none -z-10 bg-black">
        {/* Rotating Earth Lights Texture */}
        <div 
          className="absolute inset-0 bg-repeat-x animate-rotate-earth" 
          style={{
            backgroundImage: "url('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png')",
            backgroundSize: "auto 100%",
            opacity: 0.75,
          }}
        />
        {/* Atmosphere & Spherical Shadow Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.25) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.9) 70%, rgba(0, 0, 0, 1) 100%)",
            boxShadow: "inset 0 40px 120px rgba(14, 165, 233, 0.5), inset 0 -30px 120px rgba(0, 0, 0, 0.95)",
          }}
        />
      </div>

      {/* Outer Atmospheric Glow Ring */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] md:w-[1000px] md:h-[1000px] rounded-full pointer-events-none -z-20 bg-transparent shadow-[0_-40px_140px_30px_rgba(14,165,233,0.35)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Title */}
        <div className="text-center mb-20 space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">[ Global Presence ]</span>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            Our Digital Footprint
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto font-light">
            Empowering brands across the globe from our interconnected digital hubs.
          </p>
        </div>

        {/* Location Cards (iPhone glass style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {locations.map((loc, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] group shadow-lg"
            >
              <h3 className="text-base font-bold text-white mb-2 tracking-wide uppercase transition-colors group-hover:text-primary">
                {loc.country}
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-light max-w-[190px]">
                {loc.address}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
