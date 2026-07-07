"use client";

import React, { useState, useEffect } from 'react'
import Logo from './img/likumedia-logo.svg'
import Image from 'next/image'
import Menu from './nav-menu'
import MobileMenu from './mobile-menu'
import Link from 'next/link'
import { Facebook, Youtube, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 45) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showCapsule = isScrolled || !isHomePage;

  if (pathname === '/login' || pathname === '/dashboard') return null;

  return (
    <motion.div 
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 w-full pt-5 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl pointer-events-none"
    >
      <motion.div 
        layout
        className={`pointer-events-auto flex items-center justify-between h-20 px-6 sm:px-8 transition-colors duration-500 ${
          showCapsule
            ? 'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-3xl border border-neutral-200/80 dark:border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]'
            : 'bg-transparent border-transparent shadow-none'
        }`}
      >
        <div className='flex items-center gap-2'>
          <MobileMenu/>
          <Link href="/" className="block transition-transform duration-300 hover:scale-[1.03]">
            <Image 
              src={Logo} 
              alt='Liku.Media' 
              className='h-11 md:h-12 w-auto object-contain -translate-y-[3px] md:translate-y-0 transition-all duration-300' 
              priority
            />
          </Link>
        </div>
        <div className='flex items-center gap-4 md:gap-6 lg:gap-8'>
          <Menu isScrolled={showCapsule} />
          <div className='flex gap-3 items-center'>
              {/* Rotating Gradient Border Button */}
              <Link 
                href="/contact" 
                className="group relative p-[1.5px] overflow-hidden inline-flex items-center justify-center rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 h-10 w-max hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                {/* Rotating Gradient Border */}
                <div 
                  className="absolute inset-0 w-[250%] h-[250%] top-[-75%] left-[-75%] bg-[conic-gradient(from_0deg,#e11d48,#eab308,#e11d48)] animate-border-spin pointer-events-none"
                />
                
                {/* Inner Content with Gradient Background */}
                <span className="relative z-10 w-full h-full px-6 rounded-full flex items-center justify-center bg-black dark:bg-[#0a0a0a] group-hover:bg-gradient-to-r group-hover:from-[#e11d48] group-hover:to-[#eab308] text-[10px] md:text-xs font-black uppercase tracking-wider text-white transition-all duration-300">
                  START A PROJECT
                </span>
              </Link>

              <a 
                href='https://fb.com/liku.media' 
                target='_blank' 
                className={`p-1.5 hidden md:block hover:scale-110 transition-all duration-300 ${
                  showCapsule 
                    ? 'text-neutral-600 dark:text-white/70 hover:text-primary dark:hover:text-primary' 
                    : 'text-neutral-900 hover:text-[#e11d48]'
                }`}
              >
                <Facebook size={20} strokeWidth={1.2}/>
              </a>
              <a 
                href='https://www.youtube.com/@LikuMedia' 
                target='_blank' 
                className={`p-1.5 me-1 hidden md:block hover:scale-110 transition-all duration-300 ${
                  isScrolled 
                    ? 'text-neutral-600 dark:text-white/70 hover:text-primary dark:hover:text-primary' 
                    : 'text-neutral-900 hover:text-[#e11d48]'
                }`}
              >
                <Youtube size={20} strokeWidth={1.2}/>
              </a>
              <Link 
                href="/login" 
                className={`p-1.5 hover:scale-110 transition-all duration-300 ${
                  showCapsule 
                    ? 'text-neutral-600 dark:text-white/70 hover:text-[#e11d48] dark:hover:text-[#e11d48]' 
                    : 'text-neutral-900 hover:text-[#e11d48]'
                }`}
                title="Login"
              >
                <LogIn size={23} strokeWidth={1.8}/>
              </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
