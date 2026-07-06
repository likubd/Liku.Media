import React from 'react'
import Logo from './img/likumedia-logo.svg'
import Image from 'next/image'
import ThemeToggle from './theme-toggle'
import Menu from './nav-menu'
import MobileMenu from './mobile-menu'
import Link from 'next/link'
import { Facebook, Youtube, ArrowUpRight } from 'lucide-react'

export default function Header() {
  return (
    <div className='sticky top-5 z-50 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl transition-colors duration-500 pointer-events-none'>
      <div className='pointer-events-auto flex items-center justify-between h-20 px-6 sm:px-8 bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300'>
        <div className='flex items-center gap-2'>
          <MobileMenu/>
          <Link href="/" className="block">
            <div className="bg-white/95 px-4 py-2 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-[1.03]">
              <Image 
                src={Logo} 
                alt='Liku.Media' 
                className='h-7 w-auto object-contain' 
                priority
              />
            </div>
          </Link>
        </div>
        <div>
            <Menu />
        </div>
        <div className='flex gap-3 items-center'>
            <Link 
              href="/contact" 
              className='me-1 group relative overflow-hidden inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#e11d48] to-[#eab308] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 h-10'
            >
              <span className="flex items-center gap-1.5">
                <span>Get Started</span>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
            <a href='https://fb.com/liku.media' target='_blank' className='p-1.5 hidden sm:block text-white/70 hover:text-primary hover:scale-110 transition-all duration-300'><Facebook size={20} strokeWidth={1.2}/></a>
            <a href='https://www.youtube.com/@LikuMedia' target='_blank' className='p-1.5 me-1 hidden sm:block text-white/70 hover:text-primary hover:scale-110 transition-all duration-300'><Youtube size={20} strokeWidth={1.2}/></a>
            <ThemeToggle/>
        </div>
      </div>
    </div>
  )
}
