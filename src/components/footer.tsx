import React from 'react'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'

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

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden select-none bg-black py-20 text-white border-t border-white/5">
      {/* 4-Column Animated Menus Grid */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pb-16">
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

      {/* Ambient Brand Glow behind massive text */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[70%] h-40 bg-gradient-to-t from-[#e11d48]/12 via-[#eab308]/4 to-transparent blur-[80px] pointer-events-none -z-10" />

      {/* Massive Branding Text blending into bottom */}
      <div className="w-full text-center py-6">
        <h2 className="text-[12vw] sm:text-[14vw] font-black tracking-tighter uppercase leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-neutral-200/[0.12] via-neutral-300/[0.04] to-transparent">
          likumedia
        </h2>
      </div>

      {/* Bottom Compliance & Copyright Row */}
      <div className="border-t border-white/5 mt-10 pt-8 mx-auto max-w-7xl px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
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
    </footer>
  )
}
