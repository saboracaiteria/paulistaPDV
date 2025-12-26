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
    Truck,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Wallet,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingCart, label: "Vendas", href: "/dashboard/sales" },
    { icon: History, label: "Histórico", href: "/dashboard/sales/history" },
    { icon: Package, label: "Produtos", href: "/dashboard/products" },
    { icon: Users, label: "Clientes", href: "/dashboard/customers" },
    { icon: Truck, label: "Fornecedores", href: "/dashboard/suppliers" },
    { icon: CreditCard, label: "Financeiro", href: "/dashboard/finance" },
    { icon: Wallet, label: "Caixa", href: "/dashboard/finance/cashier" },
    { icon: DollarSign, label: "A Receber", href: "/dashboard/finance/receivables" },
    { icon: FileText, label: "Fiscal", href: "/dashboard/fiscal" },
    { icon: BarChart3, label: "Relatórios", href: "/dashboard/reports" },
    { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];


export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar();

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed lg:relative z-50 h-screen flex-col border-r bg-card/95 backdrop-blur-xl transition-all duration-300",
                    // Mobile: slide in from left
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    // Desktop: collapsed or expanded
                    isCollapsed ? "lg:w-16" : "lg:w-64",
                    "w-64 flex"
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center border-b px-4 bg-slate-800 text-white justify-between">
                    <div className={cn("flex items-center gap-2 font-bold text-xl", isCollapsed && "lg:justify-center")}>
                        <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-extrabold shrink-0">
                            P
                        </div>
                        {!isCollapsed && <span className="hidden lg:inline">Paulista PDV</span>}
                        <span className="lg:hidden">Paulista PDV</span>
                    </div>
                    {/* Mobile close button */}
                    <button onClick={closeMobile} className="lg:hidden p-1 hover:bg-slate-700 rounded">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="grid gap-1 px-2">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMobile}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                        isActive
                                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                                            : "text-muted-foreground",
                                        isCollapsed && "lg:justify-center lg:px-2"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                    {!isCollapsed && <span className="hidden lg:inline">{item.label}</span>}
                                    <span className="lg:hidden">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="border-t p-4 space-y-2">
                    {/* Collapse toggle - desktop only */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapsed}
                        className={cn(
                            "w-full justify-center gap-2 text-muted-foreground hidden lg:flex",
                            isCollapsed && "px-2"
                        )}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        {!isCollapsed && <span>Recolher</span>}
                    </Button>

                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10",
                            isCollapsed && "lg:justify-center lg:px-2"
                        )}
                    >
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span className="hidden lg:inline">Sair</span>}
                        <span className="lg:hidden">Sair</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
