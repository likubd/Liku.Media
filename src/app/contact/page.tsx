"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Check, 
  Send, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    if (initialService) {
      setSelectedServices([initialService]);
    }
  }, [initialService]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
      setSelectedServices([]);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      {/* Contact Info Sidebar (co.design styled) */}
      <div className="flex flex-col justify-between space-y-8 rounded-none border border-white/10 bg-white/[0.01] p-10 opacity-0 animate-fade-in-up animation-delay-100">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Contact Information</h2>
          <p className="text-base text-neutral-400 leading-relaxed font-light">
            Feel free to reach out to discuss your project requirements or request a custom quote.
          </p>

          <div className="space-y-6 pt-4">
            <div className="flex items-center space-x-4 text-base text-neutral-300 hover:text-primary transition-colors group">
              <Mail className="size-7 text-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
              <span>info@liku.media</span>
            </div>
            <div className="flex items-center space-x-4 text-base text-neutral-300 hover:text-primary transition-colors group">
              <Phone className="size-7 text-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
              <span>+880 1700-000000</span>
            </div>
            <div className="flex items-center space-x-4 text-base text-neutral-300 hover:text-primary transition-colors group">
              <MapPin className="size-7 text-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-xs uppercase tracking-widest text-neutral-500">
          <p>Office Hours: Sat - Thu (9:00 AM - 6:00 PM)</p>
        </div>
      </div>

      {/* Form Area */}
      <div className="lg:col-span-2 rounded-none border border-white/10 bg-white/[0.01] p-10 opacity-0 animate-fade-in-up animation-delay-200">
        {isSuccess ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="rounded-full bg-white/5 text-white border border-white/15 p-6">
              <Check className="size-16 stroke-[1.2]" />
            </div>
            <h3 className="text-3xl font-bold uppercase tracking-tight text-white">Thank you!</h3>
            <p className="max-w-md text-base text-neutral-400 font-light">
              Your request has been successfully received. Our representative will contact you via email or phone shortly.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-6 rounded-full border border-white bg-white px-10 py-4 text-xs font-bold uppercase tracking-wider text-black transition-all duration-300 hover:bg-transparent hover:text-white"
            >
              Send a New Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Selection Checklist */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block">
                Select Your Required Services
              </label>
              <div className="flex flex-wrap gap-2.5">
                {servicesList.map((service, index) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`inline-flex items-center rounded-full border px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-transparent border-white/10 hover:border-primary text-neutral-400 hover:text-primary hover:scale-[1.02]"
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Asadul Islam"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-5 py-3.5 text-base text-white outline-none focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. asad@example.com"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-5 py-3.5 text-base text-white outline-none focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +880 1700-000000"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-5 py-3.5 text-base text-white outline-none focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Company Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Asad Publishers"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-5 py-3.5 text-base text-white outline-none focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Project Details / Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Describe your project requirements or specific details..."
                className="w-full rounded-none border border-white/10 bg-white/[0.02] px-5 py-3.5 text-base text-white outline-none focus:border-primary transition-all duration-200 resize-none"
              />
            </div>

            {/* Premium Text-Sliding Animated Buttons (Slightly larger layout) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-primary bg-primary px-10 py-5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary h-14 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2 justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Sending Request...</span>
                </span>
              ) : (
                <span className="relative flex flex-col overflow-hidden h-4">
                  <span className="transition-transform duration-500 ease-out group-hover:-translate-y-full flex items-center"><Send className="size-4 mr-2" /> Send Request</span>
                  <span className="absolute transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0 flex items-center"><Send className="size-4 mr-2" /> Send Request</span>
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
  return (
    <div className="relative min-h-screen bg-black text-white pt-36 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Starry Space Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.08),transparent_60%)] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Back Button */}
        <div className="mb-10 opacity-0 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all duration-300">
            <ArrowLeft className="size-4 mr-1 transition-transform duration-300 transform hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-16 text-left opacity-0 animate-fade-in-up">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">[ Request Proposal ]</div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-6xl md:text-7xl leading-none">
            Get In Touch
          </h1>
          <p className="mt-6 text-base text-neutral-400 max-w-md font-light leading-relaxed">
            Fill out the form below to request a custom digital or print service proposal from Liku Media.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
