"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Users, Activity, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
    totalSales: number;
    salesCount: number;
    customersCount: number;
    lowStockCount: number;
    salesChange: number;
    ordersChange: number;
}

interface Sale {
    id: number;
    customer_name: string;
    total: number;
    created_at: string;
}

interface MonthlyData {
    month: string;
    total: number;
}

export default function DashboardPage() {
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // First day of current month
            const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString();
            // First day of last month
            const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
            const lastDayLastMonth = new Date(currentYear, currentMonth, 0).toISOString();

            try {
                // Fetch current month sales
                const { data: currentMonthSales } = await supabase
                    .from('sales')
                    .select('total')
                    .gte('created_at', firstDayCurrentMonth);

                const totalSales = currentMonthSales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
                const salesCount = currentMonthSales?.length || 0;

                // Fetch last month sales for comparison
                const { data: lastMonthSales } = await supabase
                    .from('sales')
                    .select('total')
                    .gte('created_at', firstDayLastMonth)
                    .lte('created_at', lastDayLastMonth);

                const lastMonthTotal = lastMonthSales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
                const lastMonthCount = lastMonthSales?.length || 0;

                // Calculate changes
                const salesChange = lastMonthTotal > 0 ? ((totalSales - lastMonthTotal) / lastMonthTotal) * 100 : 0;
                const ordersChange = lastMonthCount > 0 ? ((salesCount - lastMonthCount) / lastMonthCount) * 100 : 0;

                // Fetch customers count
                const { count: customersCount } = await supabase
                    .from('customers')
                    .select('*', { count: 'exact', head: true });

                // Fetch low stock products
                const { count: lowStockCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .lt('stock', 10);

                setStats({
                    totalSales,
                    salesCount,
                    customersCount: customersCount || 0,
                    lowStockCount: lowStockCount || 0,
                    salesChange,
                    ordersChange,
                });

                // Fetch recent sales
                const { data: recent } = await supabase
                    .from('sales')
                    .select('id, customer_name, total, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);

                setRecentSales(recent as Sale[] || []);

                // Fetch monthly data for chart (last 12 months)
                const monthlyResults: MonthlyData[] = [];
                const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

                for (let i = 11; i >= 0; i--) {
                    const monthDate = new Date(currentYear, currentMonth - i, 1);
                    const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);

                    const { data: monthSales } = await supabase
                        .from('sales')
                        .select('total')
                        .gte('created_at', monthDate.toISOString())
                        .lte('created_at', monthEnd.toISOString());

                    const monthTotal = monthSales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
                    monthlyResults.push({
                        month: monthNames[monthDate.getMonth()],
                        total: monthTotal,
                    });
                }

                setMonthlyData(monthlyResults);

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
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral da sua loja e performance de vendas.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
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
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.change}</p>
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
                                    className="group relative w-full bg-secondary/30 rounded-t-sm hover:bg-primary/50 transition-colors cursor-pointer"
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-sm z-10">
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
                                    <div className="font-medium text-emerald-600">
                                        + {formatCurrency(sale.total)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
