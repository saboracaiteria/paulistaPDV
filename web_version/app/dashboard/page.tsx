"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, ShoppingCart, Users, Activity, TrendingUp, Loader2, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_SALES, MOCK_CLIENTS, Sale } from "@/lib/mock-data";
import { PRODUCTS_DATA, Product } from "@/lib/products-data";

interface DashboardStats {
    totalSales: number;
    salesCount: number;
    customersCount: number;
    lowStockCount: number;
    salesChange: number;
    ordersChange: number;
}

interface MonthlyData {
    month: string;
    total: number;
}

export default function DashboardPage() {
    const router = useRouter();

    useLayoutEffect(() => {
        router.push("/dashboard/sales");
    }, [router]);

    const [stats, setStats] = useState<DashboardStats>({
        totalSales: 0,
        salesCount: 0,
        customersCount: 0,
        lowStockCount: 0,
        salesChange: 0,
        ordersChange: 0,
    });
    const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [showLowStockModal, setShowLowStockModal] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 800));

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            try {
                // Filtra vendas do mês atual
                const currentMonthSales = MOCK_SALES.filter(sale => {
                    const saleDate = new Date(sale.created_at);
                    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
                });

                const totalSales = currentMonthSales.reduce((acc, s) => acc + s.total, 0);
                const salesCount = currentMonthSales.length;

                // Vendas do mês anterior (simulado como 80% do atual para exemplo)
                const lastMonthTotal = totalSales * 0.8;
                const lastMonthCount = Math.floor(salesCount * 0.8);

                // Calculate changes
                const salesChange = lastMonthTotal > 0 ? ((totalSales - lastMonthTotal) / lastMonthTotal) * 100 : 0;
                const ordersChange = lastMonthCount > 0 ? ((salesCount - lastMonthCount) / lastMonthCount) * 100 : 0;

                // Customers count
                const customersCount = MOCK_CLIENTS.length;

                // Low stock products
                const lowStockItems = PRODUCTS_DATA.filter(p => p.stock < 10);
                const lowStockCount = lowStockItems.length;

                setStats({
                    totalSales,
                    salesCount,
                    customersCount,
                    lowStockCount,
                    salesChange,
                    ordersChange,
                });

                // Recent sales
                const recent = [...MOCK_SALES]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5);

                setRecentSales(recent);

                // Monthly data for chart (simulated distribution based on mock sales)
                const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                const monthlyResults: MonthlyData[] = [];

                for (let i = 11; i >= 0; i--) {
                    const d = new Date(currentYear, currentMonth - i, 1);
                    const monthIndex = d.getMonth();

                    // Generate randomish data for the chart since we don't have 12 months of mock data
                    const isCurrentMonth = i === 0;
                    const monthTotal = isCurrentMonth ? totalSales : Math.random() * 5000 + 1000;

                    monthlyResults.push({
                        month: monthNames[monthIndex],
                        total: monthTotal,
                    });
                }

                setMonthlyData(monthlyResults);

                // Notificar sobre estoque baixo
                if (lowStockCount > 0) {
                    toast.warning(`Atenção: ${lowStockCount} produto(s) com estoque baixo!`, {
                        description: 'Clique no card "Produtos em Baixa" para ver detalhes.',
                        duration: 6000,
                    });
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    const maxMonthlyValue = Math.max(...monthlyData.map(m => m.total), 1);

    const statCards = [
        {
            label: "Vendas do Mês",
            value: formatCurrency(stats.totalSales),
            change: `${stats.salesChange >= 0 ? '+' : ''}${stats.salesChange.toFixed(1)}% vs mês anterior`,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Pedidos",
            value: stats.salesCount.toString(),
            change: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}% vs mês anterior`,
            icon: ShoppingCart,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Clientes Cadastrados",
            value: stats.customersCount.toString(),
            change: "Total de clientes",
            icon: Users,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            label: "Produtos em Baixa",
            value: stats.lowStockCount.toString(),
            change: "Estoque < 10 unidades",
            icon: Activity,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
        },
    ];

    const handleOpenLowStock = () => {
        const lowStock = PRODUCTS_DATA
            .filter(p => p.stock < 10)
            .sort((a, b) => a.stock - b.stock);

        setLowStockProducts(lowStock);
        setShowLowStockModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-wrap-balance">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral da sua loja e performance de vendas.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <div
                        key={stat.label}
                        onClick={index === 3 && stats.lowStockCount > 0 ? handleOpenLowStock : undefined}
                        className={cn(
                            "rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md",
                            index === 3 && stats.lowStockCount > 0 && "cursor-pointer hover:border-rose-300 hover:bg-rose-50/50"
                        )}
                    >
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </p>
                            <div className={cn("rounded-full p-2", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                            <p className="text-xs text-muted-foreground tabular-nums">
                                {stat.change}
                                {index === 3 && stats.lowStockCount > 0 && " (clique para ver)"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Visão Geral de Receita
                        </h3>
                        <p className="text-sm text-muted-foreground">Movimentação dos últimos 12 meses</p>
                    </div>
                    <div className="flex h-[300px] items-end justify-between gap-2 pt-4">
                        {monthlyData.map((m, i) => {
                            const height = maxMonthlyValue > 0 ? (m.total / maxMonthlyValue) * 100 : 5;
                            return (
                                <div
                                    key={i}
                                    className="group relative w-full bg-primary/20 rounded-t-sm hover:bg-primary/50 transition-colors cursor-pointer overflow-hidden"
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-sm z-10 tabular-nums">
                                        {formatCurrency(m.total)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {monthlyData.map((m, i) => (
                            <span key={i} className="text-xs text-muted-foreground w-full text-center">{m.month}</span>
                        ))}
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold">Vendas Recentes</h3>
                        <p className="text-sm text-muted-foreground">Últimas 5 transações realizadas</p>
                    </div>
                    <div className="space-y-4">
                        {recentSales.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma venda registrada ainda.</p>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {sale.customer_name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{sale.customer_name || 'Consumidor Final'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="font-medium text-emerald-500 tabular-nums">
                                        + {formatCurrency(sale.total)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Low Stock Modal */}
            <Dialog open={showLowStockModal} onOpenChange={setShowLowStockModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="h-5 w-5" />
                            Produtos com Estoque Baixo
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhum produto com estoque baixo!
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {lowStockProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border",
                                            product.stock === 0 ? "bg-rose-50 border-rose-200" :
                                                product.stock < 5 ? "bg-amber-50 border-amber-200" :
                                                    "bg-slate-50 border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Package className={cn(
                                                "h-5 w-5",
                                                product.stock === 0 ? "text-rose-500" :
                                                    product.stock < 5 ? "text-amber-500" : "text-slate-500"
                                            )} />
                                            <div>
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.category}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-sm font-bold",
                                            product.stock === 0 ? "bg-rose-500 text-white" :
                                                product.stock < 5 ? "bg-amber-500 text-white" :
                                                    "bg-slate-200 text-slate-700"
                                        )}>
                                            {product.stock}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
