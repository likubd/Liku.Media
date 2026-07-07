"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Grid, Paintbrush, Laptop, Code } from "lucide-react";

const projectCategories = [
  { id: "all", name: "All Work", icon: Grid },
  { id: "print", name: "Print & Branding", icon: Paintbrush },
  { id: "web", name: "Web Systems", icon: Laptop },
  { id: "software", name: "Software & Apps", icon: Code },
];

const pastProjects = [
  {
    title: "EcoPrint Premium Catalog",
    client: "GreenTech Bangladesh",
    category: "print",
    desc: "Complete visual identity design, custom layouts, and high-fidelity offset printing run of standard annual product brochures.",
    color: "from-emerald-500/20 to-teal-500/20",
    tag: "Offset Print",
  },
  {
    title: "Apex FinTech Portal",
    client: "Apex Trust Limited",
    category: "web",
    desc: "Ultra-premium, custom SEO-optimized Next.js web application showcasing corporate wealth indices and investment assets.",
    color: "from-blue-500/20 to-indigo-500/20",
    tag: "Next.js Web System",
  },
  {
    title: "Liku Inventory ERP",
    client: "Liku Garments Group",
    category: "software",
    desc: "Bespoke administrative accounting framework featuring integrated invoicing engines, barcode scanners, and inventory trackers.",
    color: "from-rose-500/20 to-pink-500/20",
    tag: "Automated Software",
  },
  {
    title: "Corporate Identity Suite",
    client: "BuildCorp Developers",
    category: "print",
    desc: "A comprehensive brand rebranding initiative covering metallic business cards, gold foil letterheads, and print assets.",
    color: "from-amber-500/20 to-orange-500/20",
    tag: "Branding Package",
  },
  {
    title: "Sovereign Trading Platform",
    client: "Sovereign Capitals",
    category: "web",
    desc: "A high-performance transaction portal featuring interactive canvas visualizations and dynamic real-time reporting systems.",
    color: "from-cyan-500/20 to-sky-500/20",
    tag: "Framer & Next.js",
  },
  {
    title: "Secure Billing Client",
    client: "Dhaka Power Systems",
    category: "software",
    desc: "Offline-first custom software desktop terminal configured for safe bookkeeping logs and local client server sync.",
    color: "from-purple-500/20 to-violet-500/20",
    tag: "Desktop Software",
  }
];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = activeCategory === "all" 
    ? pastProjects 
    : pastProjects.filter(p => p.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-black text-white pt-36 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Starry Space Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl z-10">

        {/* Heading Section */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#eab308]">[ Our Showcase ]</span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            Featured Projects
          </h1>
          <p className="max-w-2xl mx-auto text-neutral-400 text-sm sm:text-base leading-relaxed">
            Explore our portfolio of elite offset print runs, custom engineering layouts, and robust software architectures.
          </p>
        </div>

        {/* Filter Categories Header */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-16">
          {projectCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                  isActive 
                    ? "bg-white text-black border-white" 
                    : "bg-white/[0.01] border-white/5 text-neutral-400 hover:text-white hover:border-white/15"
                }`}
              >
                <Icon className={`size-4 ${isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-primary'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div 
              key={idx}
              className="group relative rounded-3xl overflow-hidden bg-white/[0.01] border border-white/5 p-8 flex flex-col justify-between h-[360px] transition-all duration-300 hover:border-white/15 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5"
            >
              {/* Dynamic Gradient Color Card Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div>
                {/* Tag & Category */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#eab308] bg-[#eab308]/10 px-3 py-1.5 rounded-full">
                    {project.tag}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>

                {/* Title & Client */}
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-100 group-hover:text-white mb-2 transition-colors">
                  {project.title}
                </h3>
                <span className="text-xs text-neutral-500 font-semibold mb-4 block">
                  Client: {project.client}
                </span>

                {/* Description */}
                <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 leading-relaxed line-clamp-3 transition-colors">
                  {project.desc}
                </p>
              </div>

              {/* Bottom Call to Action */}
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:text-white transition-colors duration-300 mt-6"
              >
                <span>Launch Brief</span>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
