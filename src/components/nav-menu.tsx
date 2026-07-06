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

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu className="hidden sm:block">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-neutral-300 hover:text-primary data-[state=open]:text-primary transition-all duration-300 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-4 py-2">Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
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
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-neutral-300 hover:text-primary data-[state=open]:text-primary transition-all duration-300 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-4 py-2">Digital Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/contact" legacyBehavior passHref>
            <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center bg-transparent px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-neutral-300 transition-all duration-300 hover:text-primary focus:text-primary outline-none">
              Contact
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
