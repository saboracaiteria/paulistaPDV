"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="relative w-full max-w-md md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        placeholder="Buscar..."
                        className="h-10 w-full rounded-md border bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </Button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <User className="h-5 w-5" />
                </div>
            </div>
        </header>
    );
}
