"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

// Fallback Switch if Radix is missing
const Switch = React.forwardRef<HTMLButtonElement, any>(({ className, ...props }, ref) => {
    // Check if Radix is available (this is runtime, but we are coding for robustness)
    // Actually, I'll just write a pure React switch to avoid issues.

    // Simple controlled/uncontrolled switch
    const [checked, setChecked] = React.useState(props.checked || props.defaultChecked || false);

    const toggle = () => {
        const newVal = !checked;
        setChecked(newVal);
        if (props.onCheckedChange) props.onCheckedChange(newVal);
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={cn(
                "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-primary" : "bg-input",
                className
            )}
            onClick={toggle}
            ref={ref}
            {...props}
        >
            <span
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    )
})
Switch.displayName = "Switch"

export { Switch }
