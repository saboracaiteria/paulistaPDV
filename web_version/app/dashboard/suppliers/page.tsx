"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, Truck, Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { parseImportFile, Supplier } from "@/lib/universal-parser";
import { ImportReviewDialog } from "@/components/import-review-dialog";

interface SupplierData {
    id: number;
    name: string;
    contact: string;
    email: string;
    phone: string;
    category: string;
}

const MOCK_SUPPLIERS: SupplierData[] = [
    { id: 1, name: "Fornecedor Exemplo Ltda", contact: "João", email: "contato@exemplo.com", phone: "(11) 99999-9999", category: "Geral" },
    { id: 2, name: "Distribuidora Paulista", contact: "Maria", email: "vendas@paulista.com", phone: "(11) 88888-8888", category: "Bebidas" },
];

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<SupplierData[]>(MOCK_SUPPLIERS);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<SupplierData | null>(null);
    const [saving, setSaving] = useState(false);

    // Import Review State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Supplier[], updatedItems: Supplier[] }>({ newItems: [], updatedItems: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        email: "",
        phone: "",
        category: ""
    });

    // Smart search - supports multiple words
    const filteredSuppliers = suppliers.filter(s => {
        if (!searchTerm.trim()) return true;

        const words = searchTerm.trim().split(/\s+/).filter(w => w.length > 0);
        const searchableText = `${s.name} ${s.contact} ${s.email} ${s.category}`.toLowerCase();

        return words.every(word => searchableText.includes(word.toLowerCase()));
    });

    const handleOpenDialog = (supplier?: SupplierData) => {
        if (supplier) {
            setCurrentSupplier(supplier);
            setFormData({
                name: supplier.name,
                contact: supplier.contact || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
                category: supplier.category || ""
            });
        } else {
            setCurrentSupplier(null);
            setFormData({
                name: "",
                contact: "",
                email: "",
                phone: "",
                category: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate specific delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const payload = {
            name: formData.name,
            contact: formData.contact || "",
            email: formData.email || "",
            phone: formData.phone || "",
            category: formData.category || ""
        };

        if (currentSupplier) {
            setSuppliers(prev => prev.map(s => s.id === currentSupplier.id ? { ...s, ...payload } : s));
        } else {
            const newId = Math.max(...suppliers.map(s => s.id), 0) + 1;
            setSuppliers(prev => [...prev, { id: newId, ...payload }]);
        }

        setSaving(false);
        setIsDialogOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
            setSuppliers(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const parsedData = await parseImportFile(file, 'suppliers');

            const newItems: Supplier[] = [];
            const updatedItems: Supplier[] = [];

            parsedData.forEach(imported => {
                const existingIdx = suppliers.findIndex(s => s.name.toLowerCase() === imported.name.toLowerCase());
                if (existingIdx >= 0) {
                    updatedItems.push({ ...suppliers[existingIdx], ...imported, id: suppliers[existingIdx].id });
                } else {
                    newItems.push(imported);
                }
            });

            if (newItems.length === 0 && updatedItems.length === 0) {
                alert("Nenhuma alteração detectada no arquivo.");
                return;
            }

            setImportSummary({ newItems, updatedItems });
            setReviewOpen(true);

        } catch (err: any) {
            console.error(err);
            alert("Erro ao ler arquivo: " + err.message);
        }
        event.target.value = '';
    };

    const confirmImport = async () => {
        // Insert new items
        let nextId = Math.max(...suppliers.map(s => s.id), 0) + 1;
        const newSuppliers = importSummary.newItems.map(item => ({
            id: nextId++,
            name: item.name,
            contact: item.contact || "",
            email: item.email || "",
            phone: item.phone || "",
            category: item.category || ""
        }));

        const updatedSuppliers = [...suppliers];
        // Apply updates
        importSummary.updatedItems.forEach(update => {
            const idx = updatedSuppliers.findIndex(s => s.id === update.id);
            if (idx >= 0) {
                updatedSuppliers[idx] = {
                    ...updatedSuppliers[idx],
                    name: update.name,
                    contact: update.contact || updatedSuppliers[idx].contact,
                    email: update.email || updatedSuppliers[idx].email,
                    phone: update.phone || updatedSuppliers[idx].phone,
                    category: update.category || updatedSuppliers[idx].category
                };
            }
        });

        setSuppliers([...updatedSuppliers, ...newSuppliers]);
        setReviewOpen(false);
        alert("Importação de Fornecedores concluída!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
                    <p className="text-muted-foreground">Gerencie seus fornecedores e parceiros.</p>
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json,.pdf,.csv,.xlsx,.xls" onChange={handleFileUpload} />
                    <Button variant="outline" className="gap-2" onClick={handleImportClick}>
                        <Upload className="h-4 w-4" /> Importar
                    </Button>
                    <Button className="gap-2" onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4" /> Novo Fornecedor
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar fornecedores..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contato</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoria</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{supplier.name}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col text-sm">
                                            <span>{supplier.contact}</span>
                                            <span className="text-xs text-muted-foreground">{supplier.email}</span>
                                            <span className="text-xs text-muted-foreground">{supplier.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">{supplier.category}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(supplier)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(supplier.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nome</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact" className="text-right">Contato</Label>
                            <Input id="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoria</Label>
                            <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ImportReviewDialog
                isOpen={reviewOpen}
                onClose={() => setReviewOpen(false)}
                onConfirm={confirmImport}
                summary={importSummary}
                columns={[
                    { key: 'name', label: 'Nome' },
                    { key: 'contact', label: 'Contato' },
                    { key: 'email', label: 'Email' },
                    { key: 'category', label: 'Categoria' }
                ]}
            />
        </div>
    );
}
