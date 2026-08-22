"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Home, 
  ArrowLeft, 
  Tag, 
  Briefcase, 
  MessageSquare, 
  PhoneCall, 
  Sparkles,
  Compass,
  MessageCircle
} from "lucide-react";
import { gsap } from "gsap";

const quickLinks = [
  {
    title: "হোম পেজ",
    titleEn: "Home Page",
    desc: "প্রজেক্ট এবং সার্বিক তথ্যের জন্য হোম পেজে ফিরে যান",
    href: "/",
    icon: Home,
    badge: "মূল পাতা"
  },
  {
    title: "প্রাইসিং & সেবা",
    titleEn: "Pricing & Services",
    desc: "ডিজাইন, প্রিন্টিং ও সফটওয়্যার সেবাসমূহের মূল্য তালিকা",
    href: "/pricing",
    icon: Tag,
    badge: "প্যাকেজ"
  },
  {
    title: "পোর্টফোলিও",
    titleEn: "Projects Portfolio",
    desc: "আমাদের সাম্প্রতিক ডিজাইন ও ডেভেলপমেন্ট প্রজেক্টস",
    href: "/projects",
    icon: Briefcase,
    badge: "আমাদের কাজ"
  },
  {
    title: "এসএমএস সার্ভিস",
    titleEn: "SMS Portal",
    desc: "বাল্ক ও ডাইনামিক এসএমএস সেবা সলিউশন",
    href: "/sms",
    icon: MessageSquare,
    badge: "সলিউশন"
  },
  {
    title: "যোগাযোগ",
    titleEn: "Contact Us",
    desc: "সরাসরি প্রস্তাবনা বা সাপোর্টের জন্য মেসেজ দিন",
    href: "/contact",
    icon: PhoneCall,
    badge: "হেল্প ডেস্ক"
  }
];

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Cosmic glow breathing animation
    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { opacity: 0.3, scale: 0.9 },
        { opacity: 0.75, scale: 1.1, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    }

    // 2. Timeline sequence for smooth entrance
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (badgeRef.current) {
      tl.fromTo(badgeRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 });
    }

    if (numberRef.current) {
      tl.fromTo(
        numberRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8 },
        "-=0.3"
      );
    }

    if (titleRef.current) {
      tl.fromTo(
        titleRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
        "-=0.4"
      );
    }

    if (linksRef.current) {
      tl.fromTo(
        linksRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        "-=0.3"
      );
    }

    if (actionsRef.current) {
      tl.fromTo(
        actionsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2"
      );
    }

    if (footerRef.current) {
      tl.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        "-=0.2"
      );
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-black text-white pt-32 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col justify-between selection:bg-[#e11d48] selection:text-white"
    >
      {/* Background Cosmic Glows */}
      <div 
        ref={glowRef}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.18),rgba(234,179,8,0.06)_40%,transparent_70%)] pointer-events-none blur-2xl rounded-full" 
      />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="mx-auto max-w-5xl w-full relative z-10 text-center my-auto py-6">
        
        {/* Status Badge */}
        <div ref={badgeRef} className="inline-flex items-center space-x-2 rounded-full border border-[#e11d48]/30 bg-[#e11d48]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#e11d48] mb-6 backdrop-blur-md">
          <Sparkles className="size-3.5 animate-pulse" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* Big Animated 404 Headline */}
        <div className="relative mb-6 select-none">
          <h1 
            ref={numberRef}
            className="text-8xl sm:text-9xl md:text-[13rem] font-black tracking-tighter leading-none bg-gradient-to-b from-white via-neutral-200 to-neutral-700 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(225,29,72,0.25)]"
          >
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.4em] font-extrabold text-[#e11d48]/40 pointer-events-none whitespace-nowrap">
            Liku Media
          </div>
        </div>

        {/* Title and Description */}
        <div ref={titleRef} className="max-w-xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
            কাঙ্ক্ষিত পেজটি খুঁজে পাওয়া যায়নি
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            আপনি যে পেজটিতে প্রবেশ করার চেষ্টা করছেন তা হয়তো স্থানান্তরিত হয়েছে, মুছে ফেলা হয়েছে অথবা বর্তমানে অনুপলব্ধ।
          </p>
        </div>

        {/* Action Buttons */}
        <div ref={actionsRef} className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/"
            className="group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-[#e11d48] bg-[#e11d48] px-8 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-transparent hover:text-white hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] h-12"
          >
            <span className="relative flex items-center justify-center space-x-2">
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              <span>হোম পেজে ফিরে যান</span>
            </span>
          </Link>

          <a
            href="https://wa.me/8801850290529?text=Hello%20Liku%20Media!%20I%20came%20across%20a%20404%20error%20page."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 h-12 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          >
            <MessageCircle className="size-4" />
            <span>সরাসরি হোয়াটসঅ্যাপ সাপোর্ট</span>
          </a>
        </div>

        {/* Quick Links Section */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <Compass className="size-3.5 text-[#e11d48]" />
            <span>প্রয়োজনীয় পেজ সমূহের তালিকা</span>
          </div>

          <div 
            ref={linksRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left"
          >
            {quickLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group relative p-5 rounded-none border border-white/10 bg-white/[0.015] hover:bg-white/[0.04] hover:border-[#e11d48]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-[#e11d48] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-none bg-white/[0.03] border border-white/10 group-hover:border-[#e11d48]/40 text-[#e11d48] group-hover:scale-110 transition-transform duration-300">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 group-hover:text-amber-400 transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e11d48] transition-colors flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-neutral-500 font-normal uppercase tracking-wider">({item.titleEn})</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-light mt-1.5 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Crafted Signature */}
      <div 
        ref={footerRef}
        className="w-full text-center text-[10px] uppercase tracking-[0.25em] text-neutral-600 pt-8 border-t border-white/5 relative z-10"
      >
        crafted from ❤️ Rangpur
      </div>
    </div>
  );
}
