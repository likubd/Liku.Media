"use client"

import * as React from "react"
import { AlignLeftIcon, Facebook, Youtube } from "lucide-react"
 
import { RainbowButton } from './ui/rainbow-button'
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
            <DrawerDescription>a print & online media</DrawerDescription>
          </DrawerHeader>
          <div className="grid">
          <DrawerClose asChild>
            <Link href="/" className="p-3 hover:bg-slate-800 active:bg-slate-700 rounded">Home</Link>
          </DrawerClose>
          <DrawerClose asChild>
          <Link href="/docs" className="p-3 hover:bg-slate-800 active:bg-slate-700 rounded">Docs</Link>
          </DrawerClose>
          <DrawerClose asChild>
          <Link href="/docs" className="p-3 hover:bg-slate-800 active:bg-slate-700 rounded">Service</Link>
          </DrawerClose>
          </div>
          <DrawerFooter>
          <div className="flex gap-4 mb-4">
          <a href='https://fb.com/liku.media' target='_blank' className='p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-500 rounded-3xl'><Facebook size={22} strokeWidth={1.2}/></a>
          <a href='https://www.youtube.com/@LikuMedia' target='_blank' className='p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-500 rounded-3xl'><Youtube size={22} strokeWidth={1.2}/></a>
          </div>
            <DrawerClose asChild>
            <Link href="/contact"><RainbowButton className='w-full font-bold p-4'>Get Started</RainbowButton></Link>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
    </div>
  )
}
