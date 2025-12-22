"use client";

import { useState, useRef } from "react";
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, Truck, Download, Upload } from "lucide-react";
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

const INITIAL_SUPPLIERS: Supplier[] = [
    { id: 1, name: "Fornecedor ABC", contact: "Carlos", email: "contato@abc.com", phone: "(11) 9999-9999", category: "Bebidas" },
    { id: 2, name: "Distribuidora XYZ", contact: "Ana", email: "vendas@xyz.com", phone: "(11) 8888-8888", category: "Alimentos" },
];

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);

    // Import Review State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Supplier[], updatedItems: Supplier[] }>({ newItems: [], updatedItems: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Supplier>>({
        name: "",
        contact: "",
        email: "",
        phone: "",
        category: ""
    });

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDialog = (supplier?: Supplier) => {
        if (supplier) {
            setCurrentSupplier(supplier);
            setFormData(supplier);
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

    const handleSave = () => {
        if (currentSupplier) {
            setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? { ...formData, id: s.id } as Supplier : s));
        } else {
            const newId = Math.max(...suppliers.map(s => s.id), 0) + 1;
            setSuppliers([...suppliers, { ...formData, id: newId } as Supplier]);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
            setSuppliers(suppliers.filter(s => s.id !== id));
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
            const simulatedState = [...suppliers];

            parsedData.forEach(imported => {
                const paramsId = simulatedState.findIndex(s => s.name.toLowerCase() === imported.name.toLowerCase());
                if (paramsId >= 0) {
                    // Simulate update
                    updatedItems.push({ ...simulatedState[paramsId], ...imported, id: simulatedState[paramsId].id });
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

    const confirmImport = () => {
        setSuppliers(prev => {
            const newSuppliers = [...prev];
            // Apply updates
            importSummary.updatedItems.forEach(update => {
                const index = newSuppliers.findIndex(s => s.id === update.id);
                if (index >= 0) newSuppliers[index] = update;
            });
            // Apply additions
            let maxId = Math.max(...newSuppliers.map(s => s.id), 0);
            importSummary.newItems.forEach(item => {
                maxId++;
                newSuppliers.push({ ...item, id: maxId });
            });
            return newSuppliers;
        });
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
