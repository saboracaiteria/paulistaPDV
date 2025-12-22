import { DollarSign, ShoppingCart, Users, Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
    {
        label: "Vendas totais",
        value: "R$ 45.231,89",
        change: "+20.1% este mês",
        icon: DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        label: "Pedidos",
        value: "+2350",
        change: "+180.1% este mês",
        icon: ShoppingCart,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        label: "Clientes Ativos",
        value: "+12,234",
        change: "+19% este mês",
        icon: Users,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
    },
    {
        label: "Produtos em Baixa",
        value: "7",
        change: "-2 desde ontem",
        icon: Activity,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
    },
];

const RECENT_SALES = [
    { name: "Maria Silva", email: "maria@gmail.com", amount: 120.50 },
    { name: "João Souza", email: "joao.souza@outlook.com", amount: 75.00 },
    { name: "Ana Costa", email: "ana.costa2024@gmail.com", amount: 350.20 },
    { name: "Pedro Rocha", email: "pedro.eng@yahoo.com", amount: 42.90 },
    { name: "Loja ABC", email: "compras@lojaabc.com.br", amount: 1250.00 },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral da sua loja e performance de vendas.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
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
                        {[35, 45, 20, 60, 55, 70, 40, 50, 65, 80, 75, 90].map((h, i) => (
                            <div key={i} className="group relative w-full bg-secondary/30 rounded-t-sm hover:bg-primary/50 transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-sm z-10">
                                    R$ {h * 1500}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m) => (
                            <span key={m} className="text-xs text-muted-foreground w-full text-center">{m}</span>
                        ))}
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold">Vendas Recentes</h3>
                        <p className="text-sm text-muted-foreground">Últimas 5 transações realizadas</p>
                    </div>
                    <div className="space-y-4">
                        {RECENT_SALES.map((sale, i) => (
                            <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {sale.name.charAt(0)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                                    <p className="text-xs text-muted-foreground">{sale.email}</p>
                                </div>
                                <div className="font-medium text-emerald-600">
                                    + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
