"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

// Simplified custom Select implementation to avoid Radix dependency
const SelectContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null);

const Select = ({ value, onValueChange, children }: any) => {
    const [open, setOpen] = React.useState(false);
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative font-sans text-sm">{children}</div>
        </SelectContext.Provider>
    );
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    return (
        <button
            ref={ref}
            type="button"
            onClick={() => context?.setOpen(!context.open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<HTMLSpanElement, any>(({ className, placeholder, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    return (
        <span ref={ref} className={className} {...props}>
            {context?.value || placeholder}
        </span>
    )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, any>(({ className, children, position = "popper", ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context?.open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
                position === "popper" && "translate-y-1",
                className
            )}
            {...props}
        >
            <div className="w-full p-1 h-full max-h-[var(--radix-select-content-available-height)]">
                {children}
            </div>
        </div>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, any>(({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const isSelected = context?.value === value;

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                className
            )}
            onClick={() => {
                context?.onValueChange(value);
                context?.setOpen(false);
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
