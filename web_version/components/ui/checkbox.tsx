"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                ref={ref}
                className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 opacity-0 absolute"
                {...props}
            />
            <div className={cn(
                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground pointer-events-none peer-checked:bg-primary peer-checked:text-primary-foreground",
                className
            )}>
                <Check className="h-3 w-3 opacity-0 peer-checked:opacity-100" />
            </div>
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
