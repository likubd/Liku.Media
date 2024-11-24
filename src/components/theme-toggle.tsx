"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes";

export default function ModeToggle() {
 const { theme, setTheme } = useTheme()


 return (
   <button
     onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
   >
     <SunIcon className="text-neutral-800 dark:hidden dark:text-neutral-200"  size={24} strokeWidth={1.5}/>
     <MoonIcon className="hidden text-neutral-800 dark:block dark:text-neutral-200"  size={24} strokeWidth={1.2} />
   </button>
 )}