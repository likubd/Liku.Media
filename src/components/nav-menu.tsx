"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Graphics Design",
    href: "/#services",
    description: "Professional branding, logos, flyers, and digital design.",
  },
  {
    title: "Printing Services",
    href: "/#services",
    description: "High-quality offset, digital, and custom print solutions.",
  },
  {
    title: "UI/UX Design",
    href: "/#services",
    description: "Modern, user-centric interface and user experience designs.",
  },
  {
    title: "Software & Mobile Apps",
    href: "/#services",
    description: "Custom desktop apps, iOS, and Android application development.",
  },
  {
    title: "Website Development",
    href: "/#services",
    description: "Responsive business websites and web portals.",
  },
  {
    title: "Accounting & ERP",
    href: "/#services",
    description: "Integrated financial and enterprise resource planning software.",
  },
]

interface NavigationMenuDemoProps {
  isScrolled?: boolean
}

export default function NavigationMenuDemo({ isScrolled = false }: NavigationMenuDemoProps) {
  const linkColorClass = isScrolled
    ? "text-neutral-800 dark:text-neutral-200"
    : "text-black";

  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList className="gap-2">
        {/* Projects Link */}
        <NavigationMenuItem>
          <Link href="/projects" legacyBehavior passHref>
            <NavigationMenuLink className={cn(
              navigationMenuTriggerStyle(),
              linkColorClass
            )}>
              Projects
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Services Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className={cn(
            navigationMenuTriggerStyle(),
            linkColorClass
          )}>
            Services
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Liku.Media
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      A print & online media. Delivering premium graphics, printing, software, and web solutions.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/#services" title="Print & Media">
                Graphics design, printing, and UI/UX design services.
              </ListItem>
              <ListItem href="/#services" title="Software & Apps">
                Custom software, mobile applications, and web development.
              </ListItem>
              <ListItem href="/#services" title="Business Solutions">
                Integrated accounting software and ERP systems.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Pricing Link */}
        <NavigationMenuItem>
          <Link href="/pricing" legacyBehavior passHref>
            <NavigationMenuLink className={cn(
              navigationMenuTriggerStyle(),
              linkColorClass
            )}>
              Pricing
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group block select-none space-y-1 rounded-2xl p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-gradient-to-r hover:from-[#e11d48] hover:to-[#eab308] hover:text-white focus:bg-gradient-to-r focus:from-[#e11d48] focus:to-[#eab308] focus:text-white",
            className
          )}
          {...props}
        >
          <div className="text-sm font-bold leading-none group-hover:text-white transition-colors">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-neutral-500 dark:text-neutral-400 group-hover:text-white/80 transition-colors">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
