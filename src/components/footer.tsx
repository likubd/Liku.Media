import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden select-none bg-black py-16 text-white border-t border-white/5">
      {/* Ambient Brand Glow behind the text */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[70%] h-40 bg-gradient-to-t from-[#e11d48]/12 via-[#eab308]/4 to-transparent blur-[80px] pointer-events-none -z-10" />

      {/* Massive Branding Text with Block Reveal Animation */}
      <div className="w-full text-center py-10 flex items-center justify-center">
        <div className="relative inline-block overflow-hidden py-2 px-1">
          {/* The Text (solid color, no vertical transparency gradient) */}
          <h2 className="text-[12vw] sm:text-[14vw] font-black tracking-tighter lowercase leading-[0.8] text-neutral-200 dark:text-neutral-100 opacity-0 animate-text-reveal">
            likumedia
          </h2>
          {/* The Reveal Block */}
          <div className="absolute inset-y-2 inset-x-1 bg-gradient-to-r from-[#e11d48] to-[#eab308] origin-left scale-x-0 animate-block-reveal" />
        </div>
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
