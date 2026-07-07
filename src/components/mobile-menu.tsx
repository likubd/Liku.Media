"use client"

import * as React from "react"
import { AlignLeftIcon, Facebook, Youtube } from "lucide-react"
 
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import Link from "next/link"

const menuLinks = [
  { number: "01", name: "Home", href: "/", desc: "Return to overview" },
  { number: "02", name: "Projects", href: "/projects", desc: "View our masterpieces" },
  { number: "03", name: "Services", href: "/#services", desc: "Enterprise capabilities" },
  { number: "04", name: "Pricing", href: "/pricing", desc: "Simple transparent plans" },
  { number: "05", name: "Contact", href: "/contact", desc: "Request custom proposals" },
];

export default function DrawerDemo() {
  return (
    <div className="md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <button className="p-2 hover:scale-105 active:scale-95 transition-all duration-200 text-neutral-900 dark:text-white">
            <AlignLeftIcon size={28} strokeWidth={1.5} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="bg-[#080808] border-t border-white/10 text-white rounded-t-[32px] overflow-hidden outline-none">
          {/* Ambient Cosmic Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.06),transparent_60%)] pointer-events-none" />

          <div className="mx-auto w-full max-w-sm px-6 relative z-10 py-4">
            
            {/* Header */}
            <DrawerHeader className="border-b border-white/5 pb-4 px-0">
              <DrawerTitle className="text-xl font-black uppercase tracking-[0.2em] text-white">Liku.Media</DrawerTitle>
              <DrawerDescription className="text-[10px] text-neutral-500 font-light uppercase tracking-widest mt-1">A Print & Online Media</DrawerDescription>
            </DrawerHeader>

            {/* Premium Numbered Menu List */}
            <div className="flex flex-col divide-y divide-white/5 py-4">
              {menuLinks.map((link, idx) => (
                <DrawerClose asChild key={idx}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center justify-between py-4 px-2 hover:bg-white/[0.01] active:bg-white/[0.03] transition-all duration-300 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#e11d48] bg-[#e11d48]/10 border border-[#e11d48]/20 px-2 py-0.5 rounded">
                        {link.number}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 group-hover:text-white transition-colors">
                          {link.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-light mt-0.5">
                          {link.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-neutral-600 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1 text-sm font-light">
                      →
                    </span>
                  </Link>
                </DrawerClose>
              ))}
            </div>

            {/* Footer */}
            <DrawerFooter className="border-t border-white/5 pt-6 pb-8 px-0 flex flex-col items-center justify-between gap-6">
              {/* Glassmorphic Social Buttons */}
              <div className="flex gap-4">
                <a 
                  href="https://fb.com/liku.media" 
                  target="_blank" 
                  className="p-3 bg-white/[0.02] border border-white/5 hover:border-[#e11d48]/30 text-neutral-400 hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Facebook size={18} strokeWidth={1.5} />
                </a>
                <a 
                  href="https://www.youtube.com/@LikuMedia" 
                  target="_blank" 
                  className="p-3 bg-white/[0.02] border border-white/5 hover:border-[#e11d48]/30 text-neutral-400 hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Youtube size={18} strokeWidth={1.5} />
                </a>
              </div>

              {/* Start a Project Glowing Border Button */}
              <DrawerClose asChild>
                <Link 
                  href="/contact" 
                  className="w-full group relative p-[1.5px] overflow-hidden inline-flex items-center justify-center rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-12 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                >
                  <div 
                    className="absolute inset-0 w-[250%] h-[250%] top-[-75%] left-[-75%] bg-[conic-gradient(from_0deg,#e11d48,#eab308,#e11d48)] animate-border-spin pointer-events-none"
                  />
                  <span className="relative z-10 w-full h-full rounded-full flex items-center justify-center bg-black group-hover:bg-gradient-to-r group-hover:from-[#e11d48] group-hover:to-[#eab308] text-[10px] font-black uppercase tracking-wider text-white transition-all duration-300">
                    START A PROJECT
                  </span>
                </Link>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
