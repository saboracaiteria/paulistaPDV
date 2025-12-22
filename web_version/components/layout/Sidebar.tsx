"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Package,
    FileText,
    Settings,
    BarChart3,
    CreditCard,
    LogOut,
    Truck, // Added
    DollarSign // Added
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingCart, label: "Vendas", href: "/dashboard/sales" },
    { icon: Package, label: "Produtos", href: "/dashboard/products" },
    { icon: Users, label: "Clientes", href: "/dashboard/customers" },
    { icon: Truck, label: "Fornecedores", href: "/dashboard/suppliers" }, // Added
    { icon: CreditCard, label: "Financeiro", href: "/dashboard/finance" },
    { icon: DollarSign, label: "A Receber", href: "/dashboard/finance/receivables" }, // Added
    { icon: FileText, label: "Fiscal", href: "/dashboard/fiscal" },
    { icon: BarChart3, label: "Relatórios", href: "/dashboard/reports" },
    { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b px-6 bg-slate-800 text-white">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-extrabold">
                        P
                    </div>
                    Paulista PDV
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    );
}
