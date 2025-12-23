"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    CreditCard,
    Calendar,
    Download,
    Plus,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Mock Data with proper dates for grouping
const INITIAL_TRANSACTIONS = [
    { id: 1, desc: "Venda #10023", type: "income", date: "Hoje", time: "14:30", amount: 156.00, method: "PIX" },
    { id: 2, desc: "Fornecedor ABC Ltda", type: "expense", date: "Hoje", time: "10:00", amount: 450.00, method: "Boleto" },
    { id: 3, desc: "Venda #10022", type: "income", date: "Ontem", time: "18:45", amount: 89.90, method: "Cartão de Crédito" },
    { id: 4, desc: "Conta de Luz", type: "expense", date: "Ontem", time: "09:00", amount: 230.50, method: "Débito Automático" },
    { id: 5, desc: "Venda #10021", type: "income", date: "15/12/2025", time: "15:30", amount: 345.00, method: "Dinheiro" },
    { id: 6, desc: "Fornecedor XYZ", type: "expense", date: "15/12/2025", time: "11:00", amount: 180.00, method: "PIX" },
    { id: 7, desc: "Venda #10020", type: "income", date: "14/12/2025", time: "16:00", amount: 220.00, method: "Cartão de Débito" },
];

export default function FinancePage() {
    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
    const [newTransaction, setNewTransaction] = useState({
        desc: "",
        amount: "",
        type: "income",
        method: "Dinheiro"
    });

    // Refs for navigation
    const descRef = useRef<HTMLInputElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);
    const methodRef = useRef<HTMLSelectElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    // Auto-focus logic
    useEffect(() => {
        if (isDialogOpen) {
            setTimeout(() => descRef.current?.focus(), 100);
        }
    }, [isDialogOpen]);

    // Handle Enter Key
    const handleEnterKey = (e: React.KeyboardEvent, nextRef: React.RefObject<any> | (() => void)) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (typeof nextRef === 'function') {
                nextRef();
            } else if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };

    const handleAddTransaction = () => {
        const transaction = {
            id: transactions.length + 1,
            desc: newTransaction.desc,
            type: newTransaction.type,
            date: "Hoje",
            time: new Date().toLocaleTimeString().slice(0, 5),
            amount: Number(newTransaction.amount),
            method: newTransaction.method
        };
        setTransactions([transaction, ...transactions]);
        setIsDialogOpen(false);
        setNewTransaction({ desc: "", amount: "", type: "income", method: "Dinheiro" });
    };

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        if (typeFilter === "all") return transactions;
        return transactions.filter(t => t.type === typeFilter);
    }, [transactions, typeFilter]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups: { [date: string]: typeof transactions } = {};
        filteredTransactions.forEach(t => {
            if (!groups[t.date]) groups[t.date] = [];
            groups[t.date].push(t);
        });
        return groups;
    }, [filteredTransactions]);

    // Dynamic Stats (from filtered)
    const totalRevenue = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Fluxo de caixa, contas a pagar e receber.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" size="sm">
                        <Download className="h-4 w-4" /> <span className="hidden sm:inline">Exportar</span>
                    </Button>
                    <Button className="gap-2" size="sm" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova Transação</span>
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Receitas
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-2xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Despesas
                        </CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-2xl font-bold text-rose-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Lucro
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className={`text-lg sm:text-2xl font-bold ${netProfit >= 0 ? 'text-cyan-600' : 'text-rose-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            A Receber
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-2xl font-bold text-amber-600">R$ 2.450</div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Section */}
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg">Transações</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Agrupadas por data
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Type Filter */}
                            <div className="flex rounded-lg border overflow-hidden">
                                <button
                                    onClick={() => setTypeFilter("all")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium transition-colors",
                                        typeFilter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                    )}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setTypeFilter("income")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium transition-colors border-l",
                                        typeFilter === "income" ? "bg-emerald-500 text-white" : "hover:bg-muted"
                                    )}
                                >
                                    Receitas
                                </button>
                                <button
                                    onClick={() => setTypeFilter("expense")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium transition-colors border-l",
                                        typeFilter === "expense" ? "bg-rose-500 text-white" : "hover:bg-muted"
                                    )}
                                >
                                    Despesas
                                </button>
                            </div>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[130px] sm:w-[150px] h-8 text-xs">
                                    <SelectValue placeholder="Período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Últimos 30 dias</SelectItem>
                                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                                    <SelectItem value="today">Hoje</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Grouped List View */}
                    <div className="divide-y">
                        {Object.entries(groupedTransactions).map(([date, items]) => (
                            <div key={date}>
                                {/* Date Header */}
                                <div className="bg-muted/50 px-4 py-2 sticky top-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">{date}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {items.length} transaç{items.length === 1 ? 'ão' : 'ões'}
                                        </span>
                                    </div>
                                </div>
                                {/* Transactions for this date */}
                                <div className="divide-y divide-muted/50">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={cn(
                                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                    item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                )}>
                                                    {item.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium leading-none truncate">{item.desc}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {item.time} • {item.method}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "text-sm font-bold shrink-0 ml-2",
                                                item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                            )}>
                                                {item.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Nova Transação</DialogTitle>
                        <DialogDescription>Adicione uma receita ou despesa.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-sm">Tipo</Label>
                            <div className="col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="type" checked={newTransaction.type === 'income'} onChange={() => setNewTransaction({ ...newTransaction, type: 'income' })} />
                                    Receita
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="type" checked={newTransaction.type === 'expense'} onChange={() => setNewTransaction({ ...newTransaction, type: 'expense' })} />
                                    Despesa
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-sm">Descrição</Label>
                            <Input
                                ref={descRef}
                                className="col-span-3"
                                value={newTransaction.desc}
                                onChange={(e) => setNewTransaction({ ...newTransaction, desc: e.target.value })}
                                onKeyDown={(e) => handleEnterKey(e, amountRef)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-sm">Valor</Label>
                            <Input
                                ref={amountRef}
                                className="col-span-3"
                                type="number"
                                value={newTransaction.amount}
                                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                onKeyDown={(e) => handleEnterKey(e, methodRef)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-sm">Método</Label>
                            <select
                                ref={methodRef}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newTransaction.method}
                                onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
                                onKeyDown={(e) => handleEnterKey(e, handleAddTransaction)}
                            >
                                <option>Dinheiro</option>
                                <option>PIX</option>
                                <option>Cartão de Crédito</option>
                                <option>Cartão de Débito</option>
                                <option>Boleto</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button ref={saveButtonRef} onClick={handleAddTransaction}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
