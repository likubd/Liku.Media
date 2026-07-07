"use client";

import React from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { usePathname } from "next/navigation";

const menuSections = [
  {
    title: "Important Links",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "About Us", href: "/#services" },
      { name: "Products", href: "/#services" },
      { name: "Industry", href: "/#services" },
      { name: "Blogs", href: "/#services" },
    ]
  },
  {
    title: "Services",
    links: [
      { name: "UI/UX Design", href: "/#services" },
      { name: "Web Design", href: "/#services" },
      { name: "Logo & Branding", href: "/#services" },
      { name: "Webflow Design", href: "/#services" },
      { name: "Framer Design", href: "/#services" },
    ]
  },
  {
    title: "Specialized Industry",
    links: [
      { name: "Fintech Industry", href: "/#services" },
      { name: "Healthcare & Fitness Industry", href: "/#services" },
      { name: "Edtech Industry", href: "/#services" },
      { name: "Cybersecurity Industry", href: "/#services" },
      { name: "Company Deck", href: "/#services", isDeck: true },
    ]
  },
  {
    title: "Compare",
    links: [
      { name: "Vs Agencies", href: "/#services" },
      { name: "Vs Freelancers", href: "/#services" },
      { name: "Vs Inhouse", href: "/#services" },
    ]
  }
];

export default function GlobalLocations() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

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
            background: "radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.2) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.95) 75%, rgba(0, 0, 0, 1) 100%)",
            boxShadow: "inset 0 40px 120px rgba(14, 165, 233, 0.45), inset 0 -30px 120px rgba(0, 0, 0, 0.95)",
          }}
        />
      </div>

      {/* Outer Atmospheric Glow Ring */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] md:w-[1000px] md:h-[1000px] rounded-full pointer-events-none -z-20 bg-transparent shadow-[0_-40px_140px_30px_rgba(14,165,233,0.35)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">

        {/* 4-Column Animated Menus Grid in a Glassmorphic Panel */}
        <div className="p-8 sm:p-12 bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-6 text-left">
                <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        href={link.href}
                        className="group inline-flex items-center text-sm text-neutral-400 hover:text-primary transition-all duration-300 transform hover:translate-x-2"
                      >
                        <span>{link.name}</span>
                        {link.isDeck && (
                          <span className="ml-2 inline-flex items-center justify-center size-5 rounded-full bg-primary/20 text-primary transition-transform duration-300 group-hover:translate-y-0.5">
                            <ArrowDown className="size-3 stroke-[2.5]" />
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Compliance & Copyright Row (since main Footer is removed) */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()}, Liku Media. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary transition-colors duration-300">
              Terms & Conditions
            </Link>
            <Link href="/" className="hover:text-primary transition-colors duration-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
