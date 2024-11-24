import React from 'react'
import Logo from './img/likumedia-logo.svg'
import Image from 'next/image'
import ThemeToggle from './theme-toggle'
import Menu from './nav-menu'
import MobileMenu from './mobile-menu'
import { RainbowButton } from './ui/rainbow-button'
import Link from 'next/link'
import { Facebook, Youtube } from 'lucide-react'

export default function header() {
  return (
    <div className='flex items-center justify-between sticky top-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl lg:px-6 px-2 py-2 z-50'>
        <div className='flex items-center'>
        <MobileMenu/>
        <Link href="/"><Image src={Logo} alt='Liku.Media' className='mb-3 ms-2'/></Link>
        </div>
        <div>
            <Menu/>
        </div>
        <div className='flex gap-1 items-center'>
            <Link href="/contact"><RainbowButton className='me-3 font-bold p-4'>Get Started</RainbowButton></Link>
            <a href='https://fb.com/liku.media' target='_blank' className='p-1 hidden sm:block'><Facebook size={22} strokeWidth={1.2}/></a>
            <a href='https://www.youtube.com/@LikuMedia' target='_blank' className='p-1 me-2 hidden sm:block'><Youtube size={22} strokeWidth={1.2}/></a>
            <ThemeToggle/>
        </div>
    </div>
  )
}
