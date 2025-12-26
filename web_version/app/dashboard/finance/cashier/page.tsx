"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    Lock,
    Unlock,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    Calculator,
    Printer,
    AlertCircle,
    CheckCircle,
    Loader2,
    RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface CashRegister {
    id: number;
    date: string;
    status: "open" | "closed";
    opening_amount: number;
    closing_amount: number | null;
    expected_amount: number | null;
    difference: number | null;
    operator: string | null;
    opened_at: string;
    closed_at: string | null;
    notes: string | null;
}

interface CashMovement {
    id: number;
    register_id: number;
    type: "opening" | "sale" | "sangria" | "suprimento" | "closing";
    amount: number;
    description: string | null;
    payment_method: string | null;
    created_at: string;
}

export default function CashierPage() {
    const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
    const [movements, setMovements] = useState<CashMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dialog states
    const [openDialog, setOpenDialog] = useState<"open" | "sangria" | "suprimento" | "close" | null>(null);
    const [formAmount, setFormAmount] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [countedAmount, setCountedAmount] = useState("");

    // Fetch current register
    const fetchCurrentRegister = async () => {
        setLoading(true);
        const today = new Date().toISOString().slice(0, 10);

        // Look for an open register or today's register
        const { data, error } = await supabase
            .from("cash_registers")
            .select("*")
            .or(`status.eq.open,date.eq.${today}`)
            .order("opened_at", { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            setCurrentRegister(data[0] as CashRegister);
            fetchMovements(data[0].id);
        } else {
            setCurrentRegister(null);
            setMovements([]);
        }
        setLoading(false);
    };

    const fetchMovements = async (registerId: number) => {
        const { data } = await supabase
            .from("cash_movements")
            .select("*")
            .eq("register_id", registerId)
            .order("created_at", { ascending: false });

        if (data) {
            setMovements(data as CashMovement[]);
        }
    };

    useEffect(() => {
        fetchCurrentRegister();
    }, []);

    // Calculate totals
    const calculateTotals = () => {
        const opening = currentRegister?.opening_amount || 0;
        const sales = movements.filter(m => m.type === "sale").reduce((acc, m) => acc + m.amount, 0);
        const sangrias = movements.filter(m => m.type === "sangria").reduce((acc, m) => acc + m.amount, 0);
        const suprimentos = movements.filter(m => m.type === "suprimento").reduce((acc, m) => acc + m.amount, 0);
        const expected = opening + sales + suprimentos - sangrias;

        return { opening, sales, sangrias, suprimentos, expected };
    };

    const { opening, sales, sangrias, suprimentos, expected } = calculateTotals();

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Open Cash Register
    const handleOpenRegister = async () => {
        setSaving(true);
        const amount = Number(formAmount) || 0;

        const { data, error } = await supabase
            .from("cash_registers")
            .insert({
                opening_amount: amount,
                status: "open",
                operator: "Operador" // TODO: Get from auth
            })
            .select()
            .single();

        if (data && !error) {
            // Create opening movement
            await supabase.from("cash_movements").insert({
                register_id: data.id,
                type: "opening",
                amount: amount,
                description: "Abertura de caixa"
            });

            setCurrentRegister(data as CashRegister);
            fetchMovements(data.id);
        } else if (error) {
            alert("Erro ao abrir caixa: " + error.message);
        }

        setSaving(false);
        setOpenDialog(null);
        setFormAmount("");
    };

    // Add Sangria
    const handleSangria = async () => {
        if (!currentRegister) return;
        setSaving(true);
        const amount = Number(formAmount) || 0;

        const { error } = await supabase.from("cash_movements").insert({
            register_id: currentRegister.id,
            type: "sangria",
            amount: amount,
            description: formDescription || "Sangria"
        });

        if (error) {
            alert("Erro ao registrar sangria: " + error.message);
        } else {
            fetchMovements(currentRegister.id);
        }

        setSaving(false);
        setOpenDialog(null);
        setFormAmount("");
        setFormDescription("");
    };

    // Add Suprimento
    const handleSuprimento = async () => {
        if (!currentRegister) return;
        setSaving(true);
        const amount = Number(formAmount) || 0;

        const { error } = await supabase.from("cash_movements").insert({
            register_id: currentRegister.id,
            type: "suprimento",
            amount: amount,
            description: formDescription || "Suprimento"
        });

        if (error) {
            alert("Erro ao registrar suprimento: " + error.message);
        } else {
            fetchMovements(currentRegister.id);
        }

        setSaving(false);
        setOpenDialog(null);
        setFormAmount("");
        setFormDescription("");
    };

    // Close Cash Register
    const handleCloseRegister = async () => {
        if (!currentRegister) return;
        setSaving(true);
        const counted = Number(countedAmount) || 0;
        const diff = counted - expected;

        const { error } = await supabase
            .from("cash_registers")
            .update({
                status: "closed",
                closing_amount: counted,
                expected_amount: expected,
                difference: diff,
                closed_at: new Date().toISOString()
            })
            .eq("id", currentRegister.id);

        if (error) {
            alert("Erro ao fechar caixa: " + error.message);
        } else {
            // Add closing movement
            await supabase.from("cash_movements").insert({
                register_id: currentRegister.id,
                type: "closing",
                amount: counted,
                description: `Fechamento - Diferença: ${formatCurrency(diff)}`
            });

            fetchCurrentRegister();
        }

        setSaving(false);
        setOpenDialog(null);
        setCountedAmount("");
    };

    const getMovementIcon = (type: string) => {
        switch (type) {
            case "opening": return <Unlock className="h-4 w-4 text-blue-500" />;
            case "sale": return <DollarSign className="h-4 w-4 text-emerald-500" />;
            case "sangria": return <ArrowDownCircle className="h-4 w-4 text-rose-500" />;
            case "suprimento": return <ArrowUpCircle className="h-4 w-4 text-amber-500" />;
            case "closing": return <Lock className="h-4 w-4 text-slate-500" />;
            default: return <DollarSign className="h-4 w-4" />;
        }
    };

    const getMovementLabel = (type: string) => {
        switch (type) {
            case "opening": return "Abertura";
            case "sale": return "Venda";
            case "sangria": return "Sangria";
            case "suprimento": return "Suprimento";
            case "closing": return "Fechamento";
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isOpen = currentRegister?.status === "open";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Controle de Caixa</h1>
                    <p className="text-muted-foreground">
                        Abertura, movimentações e fechamento do caixa.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchCurrentRegister}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    {isOpen && (
                        <Button variant="outline" className="gap-2">
                            <Printer className="h-4 w-4" /> Imprimir
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Card */}
            <Card className={cn(
                "border-2",
                isOpen ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-slate-300"
            )}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isOpen ? (
                                <div className="p-3 rounded-full bg-emerald-500 text-white">
                                    <Unlock className="h-6 w-6" />
                                </div>
                            ) : (
                                <div className="p-3 rounded-full bg-slate-400 text-white">
                                    <Lock className="h-6 w-6" />
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-xl">
                                    {isOpen ? "Caixa Aberto" : "Caixa Fechado"}
                                </CardTitle>
                                <CardDescription>
                                    {currentRegister ? (
                                        <>Aberto em {new Date(currentRegister.opened_at).toLocaleString("pt-BR")}</>
                                    ) : (
                                        "Nenhum caixa aberto hoje"
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        {!isOpen ? (
                            <Button className="gap-2" onClick={() => setOpenDialog("open")}>
                                <Unlock className="h-4 w-4" /> Abrir Caixa
                            </Button>
                        ) : (
                            <Button variant="destructive" className="gap-2" onClick={() => setOpenDialog("close")}>
                                <Lock className="h-4 w-4" /> Fechar Caixa
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Summary Cards */}
            {isOpen && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Abertura</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(opening)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(sales)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sangrias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600">- {formatCurrency(sangrias)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Suprimentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">+ {formatCurrency(suprimentos)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Saldo Esperado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(expected)}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Action Buttons */}
            {isOpen && (
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => setOpenDialog("sangria")}>
                        <ArrowDownCircle className="h-4 w-4 text-rose-500" /> Sangria
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setOpenDialog("suprimento")}>
                        <ArrowUpCircle className="h-4 w-4 text-amber-500" /> Suprimento
                    </Button>
                </div>
            )}

            {/* Movements History */}
            {currentRegister && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" /> Movimentações do Dia
                        </CardTitle>
                        <CardDescription>
                            {movements.length} movimentação(ões) registrada(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {movements.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhuma movimentação registrada.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {movements.map((mov) => (
                                    <div
                                        key={mov.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-muted">
                                                {getMovementIcon(mov.type)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{getMovementLabel(mov.type)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {mov.description} • {new Date(mov.created_at).toLocaleTimeString("pt-BR")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "font-bold",
                                            mov.type === "sangria" ? "text-rose-600" :
                                                mov.type === "sale" || mov.type === "suprimento" ? "text-emerald-600" :
                                                    "text-slate-600"
                                        )}>
                                            {mov.type === "sangria" ? "-" : mov.type === "sale" || mov.type === "suprimento" ? "+" : ""}
                                            {formatCurrency(mov.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Closed Register Summary */}
            {currentRegister && currentRegister.status === "closed" && (
                <Card className="border-slate-300 bg-slate-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" /> Resumo do Fechamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Valor Esperado</div>
                                <div className="text-lg font-bold">{formatCurrency(currentRegister.expected_amount || 0)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Valor Contado</div>
                                <div className="text-lg font-bold">{formatCurrency(currentRegister.closing_amount || 0)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Diferença</div>
                                <div className={cn(
                                    "text-lg font-bold",
                                    (currentRegister.difference || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {formatCurrency(currentRegister.difference || 0)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Fechado em</div>
                                <div className="text-lg font-bold">
                                    {currentRegister.closed_at ? new Date(currentRegister.closed_at).toLocaleTimeString("pt-BR") : "-"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* DIALOGS */}

            {/* Open Dialog */}
            <Dialog open={openDialog === "open"} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Abrir Caixa</DialogTitle>
                        <DialogDescription>
                            Informe o valor inicial (fundo de troco) para abertura do caixa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="opening">Valor de Abertura (R$)</Label>
                            <Input
                                id="opening"
                                type="number"
                                placeholder="0,00"
                                value={formAmount}
                                onChange={(e) => setFormAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
                        <Button onClick={handleOpenRegister} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Abrir Caixa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sangria Dialog */}
            <Dialog open={openDialog === "sangria"} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowDownCircle className="h-5 w-5 text-rose-500" /> Registrar Sangria
                        </DialogTitle>
                        <DialogDescription>
                            Sangria é a retirada de dinheiro do caixa (ex: depósito bancário).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sangria-value">Valor (R$)</Label>
                            <Input
                                id="sangria-value"
                                type="number"
                                placeholder="0,00"
                                value={formAmount}
                                onChange={(e) => setFormAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sangria-desc">Motivo</Label>
                            <Input
                                id="sangria-desc"
                                placeholder="Ex: Depósito bancário"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleSangria} disabled={saving || !formAmount}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirmar Sangria
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suprimento Dialog */}
            <Dialog open={openDialog === "suprimento"} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowUpCircle className="h-5 w-5 text-amber-500" /> Registrar Suprimento
                        </DialogTitle>
                        <DialogDescription>
                            Suprimento é a entrada de dinheiro no caixa (ex: troco adicional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sup-value">Valor (R$)</Label>
                            <Input
                                id="sup-value"
                                type="number"
                                placeholder="0,00"
                                value={formAmount}
                                onChange={(e) => setFormAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sup-desc">Motivo</Label>
                            <Input
                                id="sup-desc"
                                placeholder="Ex: Troco adicional"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
                        <Button className="bg-amber-500 hover:bg-amber-600" onClick={handleSuprimento} disabled={saving || !formAmount}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirmar Suprimento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Close Dialog */}
            <Dialog open={openDialog === "close"} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" /> Fechar Caixa
                        </DialogTitle>
                        <DialogDescription>
                            Faça a conferência e informe o valor contado em caixa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="rounded-lg bg-slate-100 p-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Abertura:</span>
                                <span className="font-medium">{formatCurrency(opening)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                                <span>+ Vendas:</span>
                                <span className="font-medium">{formatCurrency(sales)}</span>
                            </div>
                            <div className="flex justify-between text-amber-600">
                                <span>+ Suprimentos:</span>
                                <span className="font-medium">{formatCurrency(suprimentos)}</span>
                            </div>
                            <div className="flex justify-between text-rose-600">
                                <span>- Sangrias:</span>
                                <span className="font-medium">{formatCurrency(sangrias)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                <span>Valor Esperado:</span>
                                <span className="text-primary">{formatCurrency(expected)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="counted">Valor Contado (R$)</Label>
                            <Input
                                id="counted"
                                type="number"
                                placeholder="0,00"
                                value={countedAmount}
                                onChange={(e) => setCountedAmount(e.target.value)}
                                className="text-lg font-bold"
                                autoFocus
                            />
                        </div>
                        {countedAmount && (
                            <div className={cn(
                                "rounded-lg p-3 flex items-center gap-2",
                                Number(countedAmount) - expected >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            )}>
                                {Number(countedAmount) - expected >= 0 ? (
                                    <CheckCircle className="h-5 w-5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5" />
                                )}
                                <span>
                                    Diferença: <strong>{formatCurrency(Number(countedAmount) - expected)}</strong>
                                    {Number(countedAmount) - expected > 0 && " (Sobra)"}
                                    {Number(countedAmount) - expected < 0 && " (Falta)"}
                                    {Number(countedAmount) - expected === 0 && " (Confere!)"}
                                </span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
                        <Button onClick={handleCloseRegister} disabled={saving || !countedAmount}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Fechar Caixa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
