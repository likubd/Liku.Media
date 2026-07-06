"use client";

import React, { useEffect, useRef } from "react";
import Globe from "@/components/ui/globe";
import Review from "@/components/review";
import Link from "next/link";
import { 
  Paintbrush, 
  Printer, 
  Layers, 
  Code, 
  Laptop, 
  Globe as GlobeIcon, 
  Smartphone, 
  Calculator, 
  ShieldCheck, 
  ArrowUpRight 
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
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2.5 + 1;
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
            this.x -= (dx / dist) * force * 2;
            this.y -= (dy / dist) * force * 2;
          }
        }
      }

      draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(241, 238, 235, 0.15)" : "rgba(0, 0, 0, 0.1)";
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
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
            const alpha = ((120 - dist) / 120) * 0.1;
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
            const alpha = ((180 - dist) / 180) * 0.2;
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

const services = [
  {
    icon: Paintbrush,
    title: "Graphics Design",
    desc: "Premium branding systems, logo design, marketing collateral, and packaging designs that define your identity.",
  },
  {
    icon: Printer,
    title: "Printing Services",
    desc: "State-of-the-art digital, offset, and large-format printing. Perfect execution for corporate and media clients.",
  },
  {
    icon: Layers,
    title: "UI/UX Design",
    desc: "Bespoke user interface and experience designs, interactive prototypes, and design systems for apps and webs.",
  },
  {
    icon: Code,
    title: "Software Development",
    desc: "Robust, custom-engineered desktop application solutions tailored for Windows and macOS platforms.",
  },
  {
    icon: Laptop,
    title: "Website Development",
    desc: "Premium, responsive corporate portfolios and complex e-commerce websites built with modern frameworks.",
  },
  {
    icon: GlobeIcon,
    title: "Web Applications",
    desc: "Scalable web portals, management systems, and real-time dashboards utilizing modern architectures.",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    desc: "High-performance native and hybrid application development for iOS and Android platforms.",
  },
  {
    icon: Calculator,
    title: "Accounting Software",
    desc: "Automated billing systems, inventory control, taxes, and real-time financial reporting systems.",
  },
  {
    icon: ShieldCheck,
    title: "ERP Solutions",
    desc: "Fully integrated systems managing human resources, supply chain, and multi-department operations.",
  },
];

const stats = [
  { value: "500+", label: "Completed Projects" },
  { value: "150+", label: "Happy Clients" },
  { value: "9+", label: "Digital Services" },
  { value: "5+", label: "Years Experience" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background transition-colors duration-500">
      {/* Full screen mouse constellation background */}
      <InteractiveBackground />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b border-foreground/10">
        <div className="grid grid-cols-1 items-center gap-16 py-28 lg:grid-cols-2 lg:py-40">
          {/* Left Text */}
          <div className="flex flex-col space-y-10 text-left opacity-0 animate-fade-in-up">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-foreground/50">
              [ Bespoke Design & Tech Company ]
            </div>
            
            <h1 className="text-6xl font-black tracking-tighter uppercase sm:text-8xl md:text-9xl leading-[0.9]">
              Liku Media <br />
              <span className="text-foreground/25 font-light lowercase">digital agency</span>
            </h1>

            <p className="text-2xl font-bold uppercase tracking-[0.12em] text-primary">
              A Print & Online Media
            </p>

            <p className="max-w-2xl text-xl md:text-2xl font-light text-foreground/80 leading-relaxed">
              We engineer digital excellence. Designing and developing high-fidelity printing solutions, custom desktop software, web/mobile applications, and robust enterprise resource planning (ERP) systems.
            </p>

            {/* Premium Text-Sliding Animated Buttons (Slightly larger layout) */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Link 
                href="/contact" 
                className="group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-primary bg-primary px-10 py-4.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary h-14"
              >
                <span className="relative flex flex-col overflow-hidden h-5">
                  <span className="transition-transform duration-500 ease-out group-hover:-translate-y-full">Get Started</span>
                  <span className="absolute transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0">Get Started</span>
                </span>
              </Link>
              
              <a 
                href="#services" 
                className="group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-10 py-4.5 text-sm font-bold uppercase tracking-wider text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary h-14"
              >
                <span className="relative flex flex-col overflow-hidden h-5">
                  <span className="transition-transform duration-500 ease-out group-hover:-translate-y-full">Explore Services &darr;</span>
                  <span className="absolute transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0">Explore Services &darr;</span>
                </span>
              </a>
            </div>
          </div>

          {/* Right Globe */}
          <div className="relative h-[400px] w-full sm:h-[500px] lg:h-[600px] opacity-0 animate-fade-in-up animation-delay-100 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center transform scale-110">
              <Globe className="top-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="border-b border-foreground/10 bg-foreground/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-y divide-x divide-foreground/10 md:grid-cols-4 md:divide-y-0">
            {stats.map((stat, index) => (
              <div key={index} className="group flex flex-col items-start justify-center p-10 space-y-2 transition-all duration-500 hover:bg-foreground/[0.03]">
                <span className="text-5xl font-black tracking-tight text-foreground md:text-7xl transition-all duration-300 group-hover:text-primary group-hover:scale-105">
                  {stat.value}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-foreground/50">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 border-b border-foreground/10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between space-y-6 md:space-y-0">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-foreground/50">[ Our Expertise ]</div>
            <h2 className="text-4xl font-extrabold uppercase tracking-tight sm:text-5xl md:text-6xl">
              Digital Services
            </h2>
          </div>
          <p className="max-w-md text-base text-foreground/60 leading-relaxed">
            A combined approach to media and technology. From high-quality physical print production to complex software automation systems.
          </p>
        </div>

        {/* Minimalist Border Grid (co.design style with enlarged icons and fonts) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-foreground/10">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between border-r border-b border-foreground/10 p-10 h-[360px] transition-all duration-500 hover:bg-foreground/[0.03] hover:border-foreground/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-10">
                    <div className="text-foreground/45 transition-all duration-500 transform group-hover:text-primary group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="size-14 stroke-[0.8]" />
                    </div>
                    <Link href={`/contact?service=${encodeURIComponent(service.title)}`} className="text-foreground/25 hover:text-primary transition-all duration-300">
                      <ArrowUpRight className="size-7 transition-transform duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-foreground mb-4">
                    {service.title}
                  </h3>
                </div>

                <p className="text-base text-foreground/75 leading-relaxed font-normal">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-28 bg-foreground/[0.005]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-foreground/50">[ Testimonials ]</div>
            <h2 className="text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              What Clients Say
            </h2>
          </div>
          <div className="lg:px-12">
            <Review />
          </div>
        </div>
      </div>
    </div>
  );
}
