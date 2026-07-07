"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle, ChevronDown } from "lucide-react";

const pricingTiers = [
  {
    name: "Starter (Print & Branding)",
    price: "৳৫,০০০",
    period: "Starting",
    desc: "Perfect for startups and small businesses needing physical offset print publications and initial branding packages.",
    features: [
      "Custom Logo & Brand Style Guide",
      "Corporate Stationery Design (Cards, Letterhead)",
      "High-Fidelity Flyer & Brochure Layouts",
      "Premium Offset Printing Coordination",
      "1 Revision Phase",
    ],
    cta: "Request Printing",
    highlight: false,
  },
  {
    name: "Growth (Web & Identity Suite)",
    price: "৳২৫,০০০",
    period: "Starting",
    desc: "Tailored for growing companies requiring a premium Next.js digital web presence integrated with full brand catalogs.",
    features: [
      "Ultra-Premium Next.js Web Portal (up to 5 pages)",
      "Fully Mobile-Responsive layouts",
      "Basic SEO Optimization Architecture",
      "Modern UI/UX custom wireframes",
      "Bespoke Brand Brochure Design",
      "3 Revision Phases",
      "Priority Email & Chat Support"
    ],
    cta: "Launch Digital Space",
    highlight: true,
  },
  {
    name: "Enterprise (Bespoke Software & ERP)",
    price: "৳৭৫,০০০",
    period: "Starting",
    desc: "Full-scale custom enterprise engineering, automated accounting portals, complex inventory networks, and high-volume offset runs.",
    features: [
      "Custom ERP & Automated Accounting Modules",
      "Billing, Invoicing & Inventory Databases",
      "Unlimited Web Page Systems & CMS",
      "Dedicated macOS/Windows Native Client Package",
      "Advanced Security Audits & Role Permissions",
      "Unlimited Revisions",
      "24/7 Dedicated Account Engineers"
    ],
    cta: "Consult Enterprise Engineers",
    highlight: false,
  }
];

const faqs = [
  {
    q: "How long does a custom ERP or software system implementation take?",
    a: "Depending on the complexity, size of inventory databases, and role permission structures, standard systems take between 4 to 8 weeks to design, develop, test, and securely deploy to your network."
  },
  {
    q: "Do you handle physical offset printing delivery?",
    a: "Yes! Liku Media provides end-to-end design and high-fidelity physical offset printing solutions. We coordinate production and handle direct shipping/delivery to your corporate offices in Bangladesh."
  },
  {
    q: "Can I upgrade or customize features in a tier?",
    a: "Absolutely. All packages can be custom-tailored to suit your exact needs. Contact our engineers, and we will formulate a personalized quote mapping precisely to your technical requirements."
  },
  {
    q: "Is there support provided after deployment?",
    a: "Yes, we offer structured maintenance and support SLA agreements for all custom software, ERPs, and web portals to ensure uptime, security updates, and database backup routines."
  }
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen bg-black text-white pt-36 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Starry Space Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.1),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl z-10">
        
        {/* Header Title */}
        <div className="text-center mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">[ Investment Structure ]</span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            Pricing Plans
          </h1>
          <p className="max-w-2xl mx-auto text-neutral-400 text-sm sm:text-base leading-relaxed">
            Invest in premium design, printing architecture, and custom software systems tailored for high-fidelity business operations.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between border transition-all duration-300 hover:scale-[1.02] ${
                tier.highlight 
                  ? "bg-white/[0.03] border-[#e11d48] shadow-[0_0_30px_rgba(225,29,72,0.15)]" 
                  : "bg-white/[0.01] border-white/5 hover:border-white/10"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#e11d48] to-[#eab308] text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-neutral-200 mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">{tier.price}</span>
                  <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">/ {tier.period}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-8">{tier.desc}</p>
                
                <div className="border-t border-white/5 pt-6 space-y-4 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="size-5 rounded-full bg-[#e11d48]/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link 
                href="/contact"
                className={`w-full group inline-flex items-center justify-center rounded-full py-4 text-xs font-bold uppercase tracking-wider transition-all duration-300 gap-2 ${
                  tier.highlight
                    ? "bg-gradient-to-r from-[#e11d48] to-[#eab308] text-white hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                    : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQs Accordion Block */}
        <div className="max-w-4xl mx-auto border-t border-white/5 pt-20">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">[ Frequently Asked Questions ]</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase">Have Questions?</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-white/5 rounded-2xl bg-white/[0.005] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left outline-none"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="size-5 text-primary shrink-0" />
                    <span className="text-sm sm:text-base font-bold text-neutral-200">{faq.q}</span>
                  </div>
                  <ChevronDown className={`size-5 text-neutral-400 transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
