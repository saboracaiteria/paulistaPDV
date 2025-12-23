"use client";

import { useState, useRef } from "react";
import { Plus, Search, Filter, Edit, Trash2, Calendar, DollarSign, Upload, CheckCircle, AlertCircle, Clock, CheckSquare, Square, Printer, FileText } from "lucide-react";
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

const INITIAL_RECEIVABLES: Receivable[] = [
    { id: 1, description: "Venda #10050", customer: "João Silva", value: 150.00, dueDate: "20/12/2025", status: "Pendente" },
    { id: 2, description: "Parcela 2/3 - Pedido #900", customer: "Maria Oliveira", value: 300.00, dueDate: "15/12/2025", status: "Atrasado" }, // Late relative to "today" if older
    { id: 3, description: "Serviço Prestado", customer: "Empresa X", value: 1200.00, dueDate: "25/12/2025", status: "Recebido", paymentDate: "20/12/2025", paymentMethod: "Pix" },
];

export default function ReceivablesPage() {
    const [receivables, setReceivables] = useState<Receivable[]>(INITIAL_RECEIVABLES);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlyOverdue, setOnlyOverdue] = useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [settlementOpen, setSettlementOpen] = useState(false);
    const [currentReceivable, setCurrentReceivable] = useState<Receivable | null>(null);

    // Import Review
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Receivable[], updatedItems: Receivable[] }>({ newItems: [], updatedItems: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Receivable>>({
        description: "",
        customer: "",
        value: 0,
        dueDate: "",
        status: "Pendente"
    });

    // --- Search Helper ---
    // Ignores spaces and case, e.g. "jo aosilva" matches "João Silva"
    const normalizeString = (str: string) => {
        return str.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const isOverdue = (dateStr: string) => {
        // Simple string comparison for DD/MM/YYYY is risky without parsing, but let's try strict parse
        if (!dateStr) return false;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return false;
        const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const filteredReceivables = receivables.filter(r => {
        const search = normalizeString(searchTerm);
        const descriptionMatch = normalizeString(r.description).includes(search);
        const customerMatch = normalizeString(r.customer).includes(search);
        const matchesSearch = descriptionMatch || customerMatch;

        if (!matchesSearch) return false;

        if (onlyOverdue) {
            return r.status === "Atrasado" || (r.status === "Pendente" && isOverdue(r.dueDate));
        }

        return true;
    });

    const activeReceivables = filteredReceivables.filter(r => r.status !== 'Recebido');
    const historyReceivables = filteredReceivables.filter(r => r.status === 'Recebido');

    // --- Selection Logic ---
    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = (items: Receivable[]) => {
        if (selectedIds.length === items.length && items.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(r => r.id));
        }
    };

    // --- Actions ---
    const handleOpenDialog = (item?: Receivable) => {
        if (item) {
            setCurrentReceivable(item);
            setFormData(item);
        } else {
            setCurrentReceivable(null);
            setFormData({
                description: "",
                customer: "",
                value: 0,
                dueDate: "",
                status: "Pendente"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (currentReceivable) {
            setReceivables(receivables.map(r => r.id === currentReceivable.id ? { ...formData, id: r.id } as Receivable : r));
        } else {
            const newId = Math.max(...receivables.map(r => r.id), 0) + 1;
            setReceivables([...receivables, { ...formData, id: newId } as Receivable]);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta conta?")) {
            setReceivables(receivables.filter(r => r.id !== id));
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

    const confirmImport = () => {
        setReceivables(prev => {
            const newItems = [...prev];
            let maxId = Math.max(...newItems.map(i => i.id), 0);
            importSummary.newItems.forEach(item => {
                maxId++;
                newItems.push({ ...item, id: maxId });
            });
            return newItems;
        });
        setReviewOpen(false);
        alert("Importação concluída!");
    };

    // --- Settlement Logic ---
    const handleSettlementConfirm = (settledItems: Receivable[]) => {
        setReceivables(prev => prev.map(item => {
            const settled = settledItems.find(s => s.id === item.id);
            return settled ? settled : item;
        }));
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
                                            <td className="p-4">{item.dueDate}</td>
                                            <td className="p-4 font-bold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                            </td>
                                            <td className="p-4">{getStatusBadge(item.status, item.dueDate)}</td>
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
                                            <td className="p-4">{item.paymentDate || "-"}</td>
                                            <td className="p-4">{item.paymentMethod || "-"}</td>
                                            <td className="p-4 text-muted-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.originalValue || item.value)}
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
                            <Input id="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="col-span-3" placeholder="DD/MM/AAAA" />
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
                selectedItems={receivables.filter(r => selectedIds.includes(r.id))}
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
