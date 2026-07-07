"use client";

import React, { useEffect, useRef, useState } from "react";
import Globe from "@/components/ui/globe";
import Review from "@/components/review";
import Marquee from "@/components/ui/marquee";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Paintbrush,
  Printer,
  Layers,
  Code,
  Laptop,
  Smartphone,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Cpu,
  Compass,
  Zap
} from "lucide-react";

// Interactive Mouse-Constellation Canvas Animation
function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(241, 238, 235, 0.12)" : "rgba(0, 0, 0, 0.08)";
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 20000));
    const mouse = { x: -1000, y: -1000, active: false };

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const isDark = document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx, isDark);
      });

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = ((120 - dist) / 120) * 0.08;
            ctx.strokeStyle = isDark
              ? `rgba(241, 238, 235, ${alpha})`
              : `rgba(0, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = ((180 - dist) / 180) * 0.15;
            ctx.strokeStyle = isDark
              ? `rgba(241, 238, 235, ${alpha})`
              : `rgba(0, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-20 pointer-events-none"
    />
  );
}

const bentoServices = [
  {
    icon: Paintbrush,
    title: "Graphics & Printing",
    desc: "Merging physical print precision with premium digital art. High-fidelity offset printing architectures and corporate visual identity packages.",
    colSpan: "md:col-span-2",
    badge: "Media Architecture",
    glow: "from-[#e11d48]/10 to-[#eab308]/5",
    hoverBorder: "hover:border-[#e11d48]/30",
    visual: () => <CMYKVisual />
  },
  {
    icon: Layers,
    title: "Bespoke UI/UX",
    desc: "Crafting beautiful digital product wireframes, interactive motion blueprints, and custom component libraries.",
    colSpan: "md:col-span-1",
    badge: "Creative Design",
    glow: "from-purple-500/10 to-indigo-500/5",
    hoverBorder: "hover:border-purple-500/30",
  },
  {
    icon: Smartphone,
    title: "Mobile App Hub",
    desc: "Robust native iOS and Android application systems built with modern architectures for premium consumer experiences.",
    colSpan: "md:col-span-1",
    badge: "iOS & Android",
    glow: "from-emerald-500/10 to-teal-500/5",
    hoverBorder: "hover:border-emerald-500/30",
  },
  {
    icon: Laptop,
    title: "Corporate Websites",
    desc: "Developing ultra-premium, SEO-optimized business portfolios and custom-tailored transaction portals powered by Next.js and Tailwind.",
    colSpan: "md:col-span-2",
    badge: "Web Systems",
    glow: "from-indigo-500/10 to-violet-500/5",
    hoverBorder: "hover:border-indigo-500/30",
    visual: () => <BrowserMockup />
  },
  {
    icon: Code,
    title: "Custom Software",
    desc: "Bespoke engineering solutions and local software packages optimized for specific macOS and Windows configurations.",
    colSpan: "md:col-span-1",
    badge: "Desktop Apps",
    glow: "from-amber-500/10 to-orange-500/5",
    hoverBorder: "hover:border-amber-500/30",
  },
  {
    icon: ShieldCheck,
    title: "ERP & Automated Accounting",
    desc: "Fully automated accounting software, custom billing databases, dynamic inventory trackers, and robust administrative enterprise networks.",
    colSpan: "md:col-span-2",
    badge: "Enterprise Tech",
    glow: "from-sky-500/10 to-blue-500/5",
    hoverBorder: "hover:border-sky-500/30",
    visual: () => <LedgerVisual />
  },
];

function CMYKVisual() {
  return (
    <div className="relative w-full h-full min-h-[120px] flex items-center justify-center bg-neutral-950 rounded-xl overflow-hidden select-none border border-neutral-800">
      <motion.div
        whileHover={{ scale: 1.1, x: -8, y: -4 }}
        className="absolute size-12 rounded-full bg-cyan-400/70 mix-blend-screen blur-[0.5px] translate-x-[-12px] translate-y-[-8px]"
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
      />
      <motion.div
        whileHover={{ scale: 1.1, x: 8, y: -4 }}
        className="absolute size-12 rounded-full bg-[#e11d48]/70 mix-blend-screen blur-[0.5px] translate-x-[12px] translate-y-[-8px]"
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
      />
      <motion.div
        whileHover={{ scale: 1.1, x: -4, y: 8 }}
        className="absolute size-12 rounded-full bg-[#eab308]/70 mix-blend-screen blur-[0.5px] translate-x-[-6px] translate-y-[10px]"
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
      />
      <motion.div
        whileHover={{ scale: 1.1, x: 4, y: 8 }}
        className="absolute size-12 rounded-full bg-white/10 mix-blend-screen border border-white/20 blur-[0.5px] translate-x-[6px] translate-y-[10px]"
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
      />
      <span className="absolute text-[8px] font-black uppercase tracking-widest text-white/40 pointer-events-none mt-2">
        CMYK
      </span>
    </div>
  );
}

function BrowserMockup() {
  return (
    <div className="relative w-full h-full min-h-[120px] rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex flex-col p-2.5 select-none">
      <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-800 shrink-0">
        <div className="size-1.5 rounded-full bg-red-500/80" />
        <div className="size-1.5 rounded-full bg-yellow-500/80" />
        <div className="size-1.5 rounded-full bg-green-500/80" />
        <div className="h-2.5 w-24 rounded bg-neutral-800 ml-2" />
      </div>
      <div className="flex-1 flex flex-col gap-1.5 pt-2">
        <motion.div
          initial={{ width: "30%" }}
          whileInView={{ width: "90%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-2 rounded bg-primary/20"
        />
        <div className="h-6 w-full rounded bg-neutral-900" />
        <div className="grid grid-cols-3 gap-1.5">
          <div className="h-8 rounded bg-neutral-900/60" />
          <div className="h-8 rounded bg-neutral-900/60" />
          <div className="h-8 rounded bg-neutral-900/60" />
        </div>
      </div>
    </div>
  );
}

function LedgerVisual() {
  return (
    <div className="relative w-full h-full min-h-[120px] rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex flex-col p-3 font-mono text-[8px] text-neutral-400 gap-1.5 select-none">
      <div className="flex justify-between border-b border-neutral-800 pb-1 text-[8px] font-bold text-neutral-200 shrink-0">
        <span>TRANSACTION</span>
        <span>STATUS</span>
      </div>
      <div className="space-y-1.5 flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-between items-center bg-white/[0.02] p-1 rounded border border-neutral-800"
        >
          <div className="flex flex-col">
            <span className="text-white text-[7px] font-bold">SYS-PAYMENT SUCCESS</span>
            <span className="text-[6px]">BDT +14,500</span>
          </div>
          <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[6px] font-bold flex items-center gap-1">
            <span className="size-1 rounded-full bg-emerald-400 animate-ping" />
            PAID
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-between items-center bg-white/[0.02] p-1 rounded border border-neutral-800"
        >
          <div className="flex flex-col">
            <span className="text-white text-[7px] font-bold">SYS-INV-4092 COMPLETED</span>
            <span className="text-[6px]">BDT +45,000</span>
          </div>
          <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[6px] font-bold">
            DONE
          </span>
        </motion.div>
      </div>
    </div>
  );
}



function StatsCounter({ value, label, prefix = "", suffix = "" }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const end = value;
    if (end === 0) return;

    const increment = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col p-5 rounded-2xl bg-white/40 border border-black/5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-[1.03] hover:bg-white/50 hover:shadow-md">
      <span className="text-3xl sm:text-4xl font-black text-black tracking-tight">
        {prefix}{count}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-800 mt-1">
        {label}
      </span>
    </div>
  );
}

function AnimatedDivider() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
      />
    </div>
  );
}

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic constellation bg */}
      <InteractiveBackground />

      {/* Hero Section Container with Full-Width Yellow Background & Custom Curved Bottom */}
      <section className="relative w-full pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full min-h-screen bg-[#ffd000] text-black overflow-hidden relative pt-32 pb-24 px-6 sm:px-12 rounded-none shadow-xl shadow-yellow-500/10 flex flex-col justify-center"
        >
          {/* Blueprint Grid Pattern overlay across the entire card */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Text & Embedded Actions */}
              <div className="lg:col-span-7 space-y-8 text-left">
                {/* Sparkle badge */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-black/5"
                >
                  <Sparkles className="size-4 text-[#e11d48] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-neutral-800">
                    A Print & Online Media Company
                  </span>
                </motion.div>

                {/* Massive Agency Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-black"
                >
                  We shape the <br />
                  <span className="text-[#e11d48]">future of media</span>
                </motion.h1>

                {/* Description Paragraph */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base sm:text-lg md:text-xl font-medium text-neutral-800 leading-relaxed max-w-xl"
                >
                  Liku Media is a modern design and engineering studio. We blend high-fidelity physical print solutions with custom software networks, web platforms, and mobile apps.
                </motion.p>

                {/* Embedded Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.65 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
                >
                  <Link
                    href="/contact"
                    className="group relative overflow-hidden inline-flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-900 transition-all duration-300 hover:scale-[1.02] shadow-lg h-14 px-10 text-xs font-bold uppercase tracking-wider text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>Launch Project</span>
                      <span className="text-base font-light transition-transform duration-300 group-hover:translate-x-1">↗</span>
                    </span>
                  </Link>
                  <a
                    href="#services"
                    className="group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-black/20 bg-white/30 hover:bg-white/50 text-black transition-all duration-300 h-14 px-10 text-xs font-bold uppercase tracking-wider text-center"
                  >
                    <span>Explore Capabilities</span>
                  </a>
                </motion.div>
              </div>

              {/* Right Column: Interactive Stats Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 grid grid-cols-2 gap-4 lg:pl-6"
              >
                <StatsCounter value={150} label="Offset Projects" suffix="+" />
                <StatsCounter value={85} label="Web Platforms" suffix="+" />
                <StatsCounter value={12} label="Software Modules" suffix="+" />
                <StatsCounter value={99} label="Client Success" suffix="%" />
              </motion.div>

            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-black text-white flex items-center overflow-hidden border-t border-black/10 select-none">
            <Marquee reverse className="[--duration:20s] [--gap:5rem] text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]">
              {[
                "High-Fidelity Offset Printing",
                "Bespoke UI/UX Blueprints",
                "Next.js Web Systems",
                "Custom Enterprise ERP",
                "iOS & Android Development",
                "Premium Graphic Layouts"
              ].map((item, idx) => (
                <span key={idx} className="flex items-center gap-3 text-neutral-300">
                  <span className="text-[#e11d48]">•</span>
                  <span>{item}</span>
                </span>
              ))}
            </Marquee>
          </div>
        </motion.div>
      </section>



      {/* Bento Grid Services Section */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-28 sm:py-36 sm:px-6 lg:px-8">


        {/* Premium Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bentoServices.map((service, idx) => {
            const Icon = service.icon;
            const Visual = 'visual' in service ? (service as any).visual : null;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
                className={`group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-neutral-100/50 dark:bg-neutral-900/30 border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden transition-all duration-500 ${service.hoverBorder} hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] min-h-[320px] ${service.colSpan}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Ambient glow behind card on hover */}
                <div
                  className={`absolute -right-20 -top-20 w-60 h-60 rounded-full bg-gradient-to-br ${service.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
                />

                {service.colSpan === "md:col-span-2" && Visual ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full w-full">
                    <div className="md:col-span-7 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800/40 border border-neutral-300/30 dark:border-neutral-700/30 px-3 py-1.5 rounded-full inline-block">
                            {service.badge}
                          </span>
                          <div className="text-foreground/35 group-hover:text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 md:hidden">
                            <Icon className="size-10 stroke-[1]" />
                          </div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href={`/contact?service=${encodeURIComponent(service.title)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-neutral-900 dark:hover:text-white transition-colors duration-300"
                        >
                          <span>Request Custom Quote</span>
                          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                    <div className="md:col-span-5 w-full h-full flex items-center justify-center p-2">
                      <div className="w-full max-w-[220px] aspect-[4/3] rounded-2xl bg-neutral-950 border border-neutral-800 p-2 shadow-xl shadow-black/40 overflow-hidden flex items-center justify-center">
                        <Visual />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between h-full min-h-[220px]">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800/40 border border-neutral-300/30 dark:border-neutral-700/30 px-3 py-1.5 rounded-full">
                          {service.badge}
                        </span>
                        <div className="text-foreground/35 group-hover:text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                          <Icon className="size-10 stroke-[1]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Link
                        href={`/contact?service=${encodeURIComponent(service.title)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-neutral-900 dark:hover:text-white transition-colors duration-300"
                      >
                        <span>Request Custom Quote</span>
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <AnimatedDivider />

      {/* Testimonials Review Block */}
      <section className="py-28 sm:py-36 bg-foreground/[0.002]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 text-center space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">[ What Clients Say ]</span>
            <h2 className="text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              Global Reviews
            </h2>
          </motion.div>
          <div className="lg:px-12">
            <Review />
          </div>
        </div>
      </section>
    </div>
  );
}
