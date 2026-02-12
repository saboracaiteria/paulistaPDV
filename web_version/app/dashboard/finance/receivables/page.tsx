"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Calendar, DollarSign, Upload, CheckCircle, AlertCircle, Clock, CheckSquare, Square, Printer, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseImportFile, Receivable } from "@/lib/universal-parser";
import { Badge } from "@/components/ui/badge";
import { ImportReviewDialog } from "@/components/import-review-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { SettlementDialog } from "@/components/settlement-dialog";

interface ReceivableData {
    id: number;
    description: string;
    customer: string;
    value: number;
    due_date: string;
    status: "Pendente" | "Recebido" | "Atrasado";
    original_value?: number;
    discount?: number;
    addition?: number;
    payment_date?: string;
    payment_method?: string;
}

const MOCK_RECEIVABLES: ReceivableData[] = [
    { id: 1, description: "Venda #103", customer: "João Silva", value: 250.00, due_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), status: "Pendente" },
    { id: 2, description: "Venda #99", customer: "Maria Souza", value: 120.00, due_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), status: "Atrasado" },
    { id: 3, description: "Venda #50", customer: "Pedro Henrique", value: 300.00, due_date: "2023-12-01", status: "Recebido", payment_date: "2023-12-01", payment_method: "PIX" },
];

export default function ReceivablesPage() {
    const [receivables, setReceivables] = useState<ReceivableData[]>(MOCK_RECEIVABLES);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlyOverdue, setOnlyOverdue] = useState(false);
    const [saving, setSaving] = useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [settlementOpen, setSettlementOpen] = useState(false);
    const [currentReceivable, setCurrentReceivable] = useState<ReceivableData | null>(null);

    // Import Review
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Receivable[], updatedItems: Receivable[] }>({ newItems: [], updatedItems: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<ReceivableData>>({
        description: "",
        customer: "",
        value: 0,
        due_date: "",
        status: "Pendente"
    });

    // --- Search Helper ---
    const normalizeString = (str: string) => {
        return str.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const isOverdue = (dateStr: string) => {
        if (!dateStr) return false;
        // Check if date is in YYYY-MM-DD or DD/MM/YYYY format
        let date: Date;
        if (dateStr.includes("/")) {
            const parts = dateStr.split('/');
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        } else {
            const [year, month, day] = dateStr.split("-").map(Number);
            date = new Date(year, month - 1, day);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Helper to convert DD/MM/YYYY to YYYY-MM-DD for database
    const parseDateToISO = (dateStr: string): string => {
        if (!dateStr) return "";
        if (dateStr.includes("/")) {
            const parts = dateStr.split('/');
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return dateStr;
    };

    const filteredReceivables = receivables.filter(r => {
        const search = normalizeString(searchTerm);
        const descriptionMatch = normalizeString(r.description).includes(search);
        const customerMatch = normalizeString(r.customer).includes(search);
        const matchesSearch = descriptionMatch || customerMatch;

        if (!matchesSearch) return false;

        if (onlyOverdue) {
            return r.status === "Atrasado" || (r.status === "Pendente" && isOverdue(r.due_date));
        }

        return true;
    });

    const activeReceivables = filteredReceivables.filter(r => r.status !== 'Recebido');
    const historyReceivables = filteredReceivables.filter(r => r.status === 'Recebido');

    // --- Selection Logic ---
    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = (items: ReceivableData[]) => {
        if (selectedIds.length === items.length && items.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(r => r.id));
        }
    };

    // --- Actions ---
    const handleOpenDialog = (item?: ReceivableData) => {
        if (item) {
            setCurrentReceivable(item);
            setFormData(item);
        } else {
            setCurrentReceivable(null);
            setFormData({
                description: "",
                customer: "",
                value: 0,
                due_date: "",
                status: "Pendente"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const payload: Partial<ReceivableData> = {
            description: formData.description,
            customer: formData.customer || "",
            value: Number(formData.value),
            due_date: formData.due_date || "",
            status: formData.status || "Pendente"
        };

        if (currentReceivable) {
            setReceivables(prev => prev.map(r => r.id === currentReceivable.id ? { ...r, ...payload } : r));
        } else {
            const newId = Math.max(...receivables.map(r => r.id), 0) + 1;
            setReceivables(prev => [...prev, { id: newId, ...payload } as ReceivableData]);
        }

        setSaving(false);
        setIsDialogOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta conta?")) {
            setReceivables(prev => prev.filter(r => r.id !== id));
            setSelectedIds(prev => prev.filter(sid => sid !== id));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Import Logic ---
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const parsedData = await parseImportFile(file, 'receivables');
            setImportSummary({ newItems: parsedData, updatedItems: [] });
            setReviewOpen(true);
        } catch (err: any) {
            console.error(err);
            alert("Erro ao ler arquivo: " + err.message);
        }
        event.target.value = '';
    };

    const confirmImport = async () => {
        if (importSummary.newItems.length > 0) {
            let nextId = Math.max(...receivables.map(r => r.id), 0) + 1;
            const newItems = importSummary.newItems.map(item => ({
                id: nextId++,
                description: item.description,
                customer: item.customer || "",
                value: Number(item.value),
                due_date: parseDateToISO(item.dueDate || ""),
                status: (item.status || "Pendente") as "Pendente" | "Recebido" | "Atrasado"
            }));
            setReceivables(prev => [...prev, ...newItems]);
        }
        setReviewOpen(false);
        alert("Importação concluída!");
    };

    // --- Settlement Logic ---
    const handleSettlementConfirm = async (settledItems: any[]) => { // Using any to avoid complex type matching for now
        const updatedReceivables = [...receivables];
        settledItems.forEach(item => {
            const idx = updatedReceivables.findIndex(r => r.id === item.id);
            if (idx >= 0) {
                updatedReceivables[idx] = {
                    ...updatedReceivables[idx],
                    status: "Recebido",
                    payment_date: parseDateToISO(item.paymentDate || new Date().toLocaleDateString("pt-BR")),
                    payment_method: item.paymentMethod || "",
                    original_value: item.originalValue || undefined,
                    discount: item.discount || undefined,
                    addition: item.addition || undefined
                };
            }
        });
        setReceivables(updatedReceivables);
        setSettlementOpen(false);
        setSelectedIds([]);
        alert("Baixa realizada com sucesso!");
    };

    const getStatusBadge = (status: string, dueDate: string) => {
        if (status === "Recebido") return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Recebido</Badge>;

        // Dynamic "Atrasado" check
        if (isOverdue(dueDate)) return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Atrasado</Badge>;

        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
                    <p className="text-muted-foreground">Gerencie seus recebimentos, baixas e relatórios.</p>
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json,.pdf,.csv,.xlsx,.xls" onChange={handleFileUpload} />
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" /> Imprimir
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleImportClick}>
                        <Upload className="h-4 w-4" /> Importar
                    </Button>
                    <Button className="gap-2" onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4" /> Nova Conta
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm no-print">
                <div className="flex items-center justify-between p-6 border-b flex-wrap gap-4">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar (ex: joaosilva)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="overdue"
                                checked={onlyOverdue}
                                onChange={(e) => setOnlyOverdue(e.target.checked)}
                            />
                            <Label htmlFor="overdue" className="cursor-pointer">Apenas Vencidas</Label>
                        </div>
                        {selectedIds.length > 0 && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setSettlementOpen(true)}
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Baixar ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="open" className="w-full">
                <TabsList className="no-print">
                    <TabsTrigger value="open">Em Aberto</TabsTrigger>
                    <TabsTrigger value="history">Histórico (Recebidas)</TabsTrigger>
                </TabsList>

                {/* --- TAB: ACTIVE --- */}
                <TabsContent value="open" className="space-y-4">
                    <div className="rounded-md border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-12 px-4 w-[50px] no-print">
                                        <Checkbox
                                            checked={selectedIds.length === activeReceivables.length && activeReceivables.length > 0}
                                            onChange={() => toggleAll(activeReceivables)}
                                        />
                                    </th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Descrição</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Cliente</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Vencimento</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Valor</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground no-print">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeReceivables.length === 0 ? (
                                    <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">Nenhuma conta encontrada.</td></tr>
                                ) : (
                                    activeReceivables.map((item) => (
                                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 no-print">
                                                <Checkbox
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelection(item.id)}
                                                />
                                            </td>
                                            <td className="p-4 font-medium">{item.description}</td>
                                            <td className="p-4">{item.customer}</td>
                                            <td className="p-4">{new Date(item.due_date + "T12:00:00").toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 font-bold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                            </td>
                                            <td className="p-4">{getStatusBadge(item.status, item.due_date)}</td>
                                            <td className="p-4 no-print">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {activeReceivables.length > 0 && (
                                    <tr className="bg-muted/20 font-bold">
                                        <td colSpan={4} className="p-4 text-right">Total:</td>
                                        <td className="p-4 text-emerald-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                activeReceivables.reduce((acc, curr) => acc + curr.value, 0)
                                            )}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* --- TAB: HISTORY --- */}
                <TabsContent value="history">
                    <div className="rounded-md border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Descrição</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Cliente</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Pagamento</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Forma</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Valor Original</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Desconto</th>
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Valor Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyReceivables.length === 0 ? (
                                    <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">Nenhuma conta baixada encontrada.</td></tr>
                                ) : (
                                    historyReceivables.map((item) => (
                                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 font-medium">{item.description}</td>
                                            <td className="p-4">{item.customer}</td>
                                            <td className="p-4">{item.payment_date ? new Date(item.payment_date + "T12:00:00").toLocaleDateString('pt-BR') : "-"}</td>
                                            <td className="p-4">{item.payment_method || "-"}</td>
                                            <td className="p-4 text-muted-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.original_value || item.value)}
                                            </td>
                                            <td className="p-4 text-red-500">
                                                {item.discount ? `- ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.discount)}` : "-"}
                                            </td>
                                            <td className="p-4 font-bold text-emerald-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- Dialogs --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentReceivable ? "Editar Conta" : "Nova Conta"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">Descrição</Label>
                            <Input id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer" className="text-right">Cliente</Label>
                            <Input id="customer" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right">Valor</Label>
                            <Input id="value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Vencimento</Label>
                            <Input id="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="col-span-3" placeholder="YYYY-MM-DD" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SettlementDialog
                isOpen={settlementOpen}
                onClose={() => setSettlementOpen(false)}
                // Use a mapped version to match what the dialog expects if needed, or fix types.
                // For now, assuming compatibility with props.
                selectedItems={receivables.filter(r => selectedIds.includes(r.id)).map(r => ({
                    ...r,
                    dueDate: r.due_date,
                    originalValue: r.original_value,
                    paymentDate: r.payment_date,
                    paymentMethod: r.payment_method
                })) as any}
                onConfirm={handleSettlementConfirm}
            />

            <ImportReviewDialog
                isOpen={reviewOpen}
                onClose={() => setReviewOpen(false)}
                onConfirm={confirmImport}
                summary={importSummary}
                columns={[
                    { key: 'description', label: 'Descrição' },
                    { key: 'customer', label: 'Cliente' },
                    { key: 'value', label: 'Valor' },
                    { key: 'dueDate', label: 'Vencimento' },
                ]}
            />

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { font-size: 12pt; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                }
            `}</style>
        </div>
    );
}
