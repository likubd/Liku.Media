import React from 'react'
import Logo from './img/likumedia-logo.svg'
import Image from 'next/image'
import ThemeToggle from './theme-toggle'
import Menu from './nav-menu'
import { RainbowButton } from './ui/rainbow-button'
import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from './ui/button'

export default function header() {
  return (
    <div className='flex items-center justify-between sticky top-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 z-50'>
        <div>
            <Link href="/"><Image src={Logo} alt='Liku.Media'/></Link>
        </div>
        <div>
            <Menu/>
        </div>
        <div className='flex gap-1 items-center'>
            <RainbowButton className='me-3'>Get Started</RainbowButton>
            <Button variant="ghost" size="icon">
            <Github className='h-[1.2rem] w-[1.2rem]'/>
            </Button>
            <ThemeToggle/>
        </div>
    </div>
  )
}
