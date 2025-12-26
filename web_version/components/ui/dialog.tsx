"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto">
            {/* Backdrop - solid dark overlay */}
            <div
                className="fixed inset-0 bg-slate-900/90"
                onClick={() => onOpenChange && onOpenChange(false)}
            />
            {children}
        </div>
    );
};

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative z-50 w-full max-w-lg my-4 mx-4",
            "bg-white rounded-xl shadow-2xl",
            "border-0 overflow-hidden",
            "animate-in slide-in-from-bottom-4 zoom-in-95 duration-200",
            className
        )}
        {...props}
    >
        {/* Accent bar at top */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        <div className="p-6">
            {children}
        </div>
    </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 pb-4 border-b border-slate-200",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-row justify-end gap-3 pt-6 mt-4 border-t border-slate-200",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-xl font-bold text-slate-800 tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500 mt-1", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}

