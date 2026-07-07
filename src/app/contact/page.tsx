"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Check, 
  Send, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { gsap } from "gsap";

const servicesList = [
  "Graphics Design",
  "Printing Services",
  "UI/UX Design",
  "Software Development",
  "Website Development",
  "Web Applications",
  "Mobile Applications",
  "Accounting Software",
  "ERP Solutions",
];

function ContactForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "";

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const waUrlRef = useRef("");

  useEffect(() => {
    if (initialService) {
      setSelectedServices([initialService]);
    }
  }, [initialService]);

  // Handle WhatsApp countdown redirect timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      if (waUrlRef.current) {
        window.open(waUrlRef.current, "_blank");
      }
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown]);

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const messageId = "MSG-" + Math.floor(100000 + Math.random() * 900000);
      const messagePayload = {
        id: messageId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || "N/A",
        message: formData.message,
        services: selectedServices,
        createdAt: new Date().toISOString()
      };

      // 1. Save contact message document in Cloud Firestore messages collection
      const docRef = doc(db, "messages", messageId);
      await setDoc(docRef, messagePayload);

      // 2. Build WhatsApp API message string
      const waText = `*New Proposal Request - Liku Media*\n\n` +
        `*Name:* ${formData.name}\n` +
        `*Email:* ${formData.email}\n` +
        `*Phone:* ${formData.phone}\n` +
        `*Company:* ${formData.company || "N/A"}\n` +
        `*Requested Services:* ${selectedServices.join(", ") || "None selected"}\n\n` +
        `*Message/Details:* \n${formData.message}`;

      const waUrl = `https://wa.me/8801850290529?text=${encodeURIComponent(waText)}`;
      waUrlRef.current = waUrl;

      // 3. Trigger success and start 30s countdown
      setCountdown(30);
      setIsSuccess(true);

      // Clear input fields
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
      setSelectedServices([]);

    } catch (err) {
      console.error("Firestore Message Save Error:", err);
      alert("Error submitting proposal request. Please check internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 max-w-5xl mx-auto items-stretch">
      {/* Contact Info Sidebar */}
      <div className="flex flex-col justify-between space-y-8 rounded-none p-8 border border-white/10 bg-white/[0.01] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-[2px] h-full bg-[#e11d48] opacity-50" />
        <div className="space-y-6 text-left">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white">Liku Media</h2>
            <p className="text-[10px] text-[#e11d48] font-black uppercase tracking-widest mt-1">Direct Help Desk</p>
          </div>
          
          <div className="space-y-4 pt-4">
            <a href="mailto:liku.media@gmail.com" className="flex items-center space-x-3 text-xs text-neutral-400 hover:text-white transition-colors py-1 group/item">
              <Mail className="size-4 text-[#e11d48] group-hover/item:scale-110 transition-transform" />
              <span>liku.media@gmail.com</span>
            </a>
            <a href="tel:01723502887" className="flex items-center space-x-3 text-xs text-neutral-400 hover:text-white transition-colors py-1 group/item">
              <Phone className="size-4 text-[#e11d48] group-hover/item:scale-110 transition-transform" />
              <span>+880 1723-502887</span>
            </a>
            <div className="flex items-center space-x-3 text-xs text-neutral-400 py-1">
              <MapPin className="size-4 text-[#e11d48]" />
              <span>Rangpur, Dhaka, Bangladesh</span>
            </div>
          </div>

          <span className="h-[1px] w-full bg-white/10 block my-4" />

          {/* Quick WhatsApp Link */}
          <div className="space-y-3">
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Fast Response</div>
            <a 
              href="https://wa.me/8801850290529?text=Hello%20Liku%20Media!%20I'd%20like%20to%20inquire%20about%20a%20project." 
              target="_blank"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              <MessageCircle className="size-4" />
              <span>WhatsApp Quick Chat</span>
            </a>
          </div>
        </div>

        <div className="text-[9px] uppercase tracking-widest text-neutral-600">
          <p>Office: Sat - Thu (9:00 AM - 6:00 PM)</p>
        </div>
      </div>

      {/* Form Area with Countdown Loader */}
      <div className="lg:col-span-2 rounded-none border border-white/10 bg-white/[0.01] p-8 sm:p-10 text-left">
        {isSuccess ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-5">
              <Check className="size-12 stroke-[1.2]" />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Proposal Saved</h3>
            <p className="max-w-md text-[11px] text-neutral-400 font-light leading-relaxed">
              Your request has been successfully written to Liku Media client dashboard. Preparing WhatsApp redirect...
            </p>

            {/* Countdown indicators */}
            <div className="space-y-2 w-full max-w-xs pt-4">
              <div className="flex justify-between text-[9px] uppercase font-black tracking-wider text-neutral-500">
                <span>WhatsApp Redirect</span>
                <span className="text-[#e11d48]">{countdown}s</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#e11d48] transition-all duration-1000 ease-linear" 
                  style={{ width: `${(countdown / 30) * 100}%` }} 
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => {
                  if (waUrlRef.current) {
                    window.open(waUrlRef.current, "_blank");
                  }
                }}
                className="rounded-full bg-[#e11d48] border border-[#e11d48] px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 h-10 hover:bg-transparent hover:text-white"
              >
                Send Message Now
              </button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setCountdown(30);
                }}
                className="rounded-full border border-white/10 hover:border-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 h-10"
              >
                Submit New Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection Checklist */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Services Required *
              </div>
              <div className="flex flex-wrap gap-2">
                {servicesList.map((service, index) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`inline-flex items-center rounded-full border px-4.5 py-2 text-[10px] font-bold tracking-wide transition-all duration-200 ${
                        isSelected
                          ? "bg-[#e11d48] border-[#e11d48] text-white shadow-sm"
                          : "bg-transparent border-white/10 hover:border-[#e11d48]/50 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name *"
                  className="w-full rounded-none border border-white/15 focus:border-[#e11d48] bg-white/[0.01] focus:bg-white/[0.03] px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 h-12"
                />
              </div>

              <div className="space-y-1">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address *"
                  className="w-full rounded-none border border-white/15 focus:border-[#e11d48] bg-white/[0.01] focus:bg-white/[0.03] px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 h-12"
                />
              </div>

              <div className="space-y-1">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number *"
                  className="w-full rounded-none border border-white/15 focus:border-[#e11d48] bg-white/[0.01] focus:bg-white/[0.03] px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 h-12"
                />
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full rounded-none border border-white/15 focus:border-[#e11d48] bg-white/[0.01] focus:bg-white/[0.03] px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 h-12"
                />
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Describe your project requirements or specific details... *"
                className="w-full rounded-none border border-white/15 focus:border-[#e11d48] bg-white/[0.01] focus:bg-white/[0.03] px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 resize-none"
              />
            </div>

            {/* Submit & Redirect Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-[#e11d48] bg-[#e11d48] px-10 py-4 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-transparent hover:text-white h-12 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2 justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting Proposal...</span>
                </span>
              ) : (
                <span className="relative flex flex-col overflow-hidden h-4">
                  <span className="transition-transform duration-500 ease-out group-hover:-translate-y-full flex items-center justify-center"><Send className="size-3.5 mr-2" /> Submit Proposal</span>
                  <span className="absolute transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0 flex items-center justify-center"><Send className="size-3.5 mr-2" /> WhatsApp Redirect</span>
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Contact() {
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Cosmic glow slow breathing effect
    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { opacity: 0.4, scale: 0.95 },
        { opacity: 0.8, scale: 1.05, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    }

    // 2. Entrance sequence animation
    const tl = gsap.timeline();

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }

    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    }

    if (signatureRef.current) {
      tl.fromTo(
        signatureRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white pt-36 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Starry Space Glow */}
      <div 
        ref={glowRef}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.08),transparent_60%)] pointer-events-none" 
      />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div ref={headerRef} className="space-y-4 mb-16 text-center max-w-xl mx-auto">
          {/* Back Button */}
          <div>
            <Link href="/" className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-all duration-300">
              <ArrowLeft className="size-3.5 mr-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-3 pt-2">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl leading-none">
              Contact Liku Media
            </h1>
            <p className="text-[10px] text-neutral-500 font-light leading-relaxed uppercase tracking-wider">
              Request a proposal from the design & print professionals.
            </p>
          </div>
        </div>

        {/* Content Form Section */}
        <div ref={contentRef}>
          <Suspense fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          }>
            <ContactForm />
          </Suspense>
        </div>

        {/* Crafted Signature */}
        <div 
          ref={signatureRef}
          className="mt-24 border-t border-white/5 pt-8 text-center text-[10px] uppercase tracking-[0.25em] text-neutral-600"
        >
          crafted from ❤️ Rangpur
        </div>

      </div>
    </div>
  );
}
