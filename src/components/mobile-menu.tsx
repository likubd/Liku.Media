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

export default function DrawerDemo() {
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <div className="lg:hidden md:hidden sm:hidden">
        <Drawer>
      <DrawerTrigger asChild>
         <button>
         <AlignLeftIcon size={28} strokeWidth={1.2}/>
         </button>
       </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm px-4">
          <DrawerHeader>
            <DrawerTitle>Liku.Media</DrawerTitle>
            <DrawerDescription>A Print & Online Media</DrawerDescription>
          </DrawerHeader>
          <div className="grid">
          <DrawerClose asChild>
            <Link href="/" className="p-3 hover:bg-slate-800 active:bg-slate-700 rounded">Home</Link>
          </DrawerClose>
          <DrawerClose asChild>
          <Link href="/#services" className="p-3 hover:bg-slate-800 active:bg-slate-700 rounded">Services</Link>
          </DrawerClose>
          <DrawerClose asChild>
          <Link href="/contact" className="p-3 hover:bg-slate-800 active:bg-slate-700 rounded">Contact</Link>
          </DrawerClose>
          </div>
          <DrawerFooter>
          <div className="flex gap-4 mb-4">
          <a href='https://fb.com/liku.media' target='_blank' className='p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-500 rounded-3xl'><Facebook size={22} strokeWidth={1.2}/></a>
          <a href='https://www.youtube.com/@LikuMedia' target='_blank' className='p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-500 rounded-3xl'><Youtube size={22} strokeWidth={1.2}/></a>
          </div>
            <DrawerClose asChild>
            <Link 
              href="/contact" 
              className='w-full group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-foreground bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-wider text-background transition-all duration-300 hover:bg-transparent hover:text-foreground h-11'
            >
              <span className="relative flex flex-col overflow-hidden h-4">
                <span className="transition-transform duration-300 group-hover:-translate-y-full">Get Started</span>
                <span className="absolute transition-transform duration-300 translate-y-full group-hover:translate-y-0">Get Started</span>
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
