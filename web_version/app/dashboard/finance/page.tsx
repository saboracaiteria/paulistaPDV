"use client";

import { useState, useRef, useEffect } from "react";
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

// Mock Data
const INITIAL_TRANSACTIONS = [
    { id: 1, desc: "Venda #10023", type: "income", date: "Hoje, 14:30", amount: 156.00, method: "PIX" },
    { id: 2, desc: "Fornecedor ABC Ltda", type: "expense", date: "Hoje, 10:00", amount: 450.00, method: "Boleto" },
    { id: 3, desc: "Venda #10022", type: "income", date: "Ontem, 18:45", amount: 89.90, method: "Cartão de Crédito" },
    { id: 4, desc: "Conta de Luz", type: "expense", date: "Ontem, 09:00", amount: 230.50, method: "Débito Automático" },
    { id: 5, desc: "Venda #10021", type: "income", date: "15/12/2025", amount: 345.00, method: "Dinheiro" },
];

export default function FinancePage() {
    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
            date: "Hoje, " + new Date().toLocaleTimeString().slice(0, 5),
            amount: Number(newTransaction.amount),
            method: newTransaction.method
        };
        setTransactions([transaction, ...transactions]);
        setIsDialogOpen(false);
        setNewTransaction({ desc: "", amount: "", type: "income", method: "Dinheiro" });
    };

    // Dynamic Stats
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted-foreground">
                        Fluxo de caixa, contas a pagar e receber.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Exportar
                    </Button>
                    <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> Nova Transação
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Receita Total (Atual)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Baseado nas transações listadas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Despesas (Atual)
                        </CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Baseado nas transações listadas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Lucro Líquido
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-cyan-600' : 'text-rose-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Receitas - Despesas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            A Receber
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">R$ 2.450,00</div>
                        <p className="text-xs text-muted-foreground">
                            8 faturas pendentes (Simulado)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Transações Recentes</CardTitle>
                            <CardDescription>
                                Últimas movimentações financeiras do sistema.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Periodo" />
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
                    {/* List View - More compact */}
                    <div className="divide-y">
                        {transactions.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                        }`}>
                                        {item.type === 'income' ? <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" /> : <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-none truncate">{item.desc}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {item.date} • {item.method}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-sm sm:text-base font-bold shrink-0 ml-2 ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                    {item.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Transação</DialogTitle>
                        <DialogDescription>Adicione uma receita ou despesa.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tipo</Label>
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
                            <Label className="text-right">Descrição</Label>
                            <Input
                                ref={descRef}
                                className="col-span-3"
                                value={newTransaction.desc}
                                onChange={(e) => setNewTransaction({ ...newTransaction, desc: e.target.value })}
                                onKeyDown={(e) => handleEnterKey(e, amountRef)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Valor</Label>
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
                            <Label className="text-right">Método</Label>
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button ref={saveButtonRef} onClick={handleAddTransaction}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
