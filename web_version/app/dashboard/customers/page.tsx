"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, MapPin, Download, Upload, Loader2 } from "lucide-react";
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
import { parseImportFile, Customer } from "@/lib/universal-parser";
import { ImportReviewDialog } from "@/components/import-review-dialog";
import { supabase } from "@/lib/supabase";

interface ClientData {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
}

export default function CustomersPage() {
    const [clients, setClients] = useState<ClientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<ClientData | null>(null);
    const [saving, setSaving] = useState(false);

    // Import Review State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Customer[], updatedItems: Customer[] }>({ newItems: [], updatedItems: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: ""
    });

    // Fetch clients from Supabase
    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("name");

        if (data && !error) {
            setClients(data as ClientData[]);
        } else if (error) {
            console.error("Error fetching customers:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Smart search - supports multiple words (e.g., "JO SIL" finds "João Silva")
    const filteredClients = clients.filter(client => {
        if (!searchTerm.trim()) return true;

        const words = searchTerm.trim().split(/\s+/).filter(w => w.length > 0);
        const searchableText = `${client.name} ${client.email} ${client.phone} ${client.city}`.toLowerCase();

        // All words must be present (AND logic)
        return words.every(word => searchableText.includes(word.toLowerCase()));
    });

    const handleOpenDialog = (client?: ClientData) => {
        if (client) {
            setCurrentClient(client);
            setFormData({
                name: client.name,
                email: client.email || "",
                phone: client.phone || "",
                address: client.address || "",
                city: client.city || ""
            });
        } else {
            setCurrentClient(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
                city: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null
        };

        let error;
        if (currentClient) {
            // Update
            const result = await supabase
                .from("customers")
                .update(payload)
                .eq("id", currentClient.id);
            error = result.error;
        } else {
            // Insert
            const result = await supabase.from("customers").insert(payload);
            error = result.error;
        }

        setSaving(false);
        if (error) {
            alert("Erro ao salvar cliente: " + error.message);
        } else {
            setIsDialogOpen(false);
            fetchClients();
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este cliente?")) {
            const { error } = await supabase.from("customers").delete().eq("id", id);
            if (error) {
                alert("Erro ao excluir: " + error.message);
            } else {
                fetchClients();
            }
        }
    };

    // --- Import/Export ---
    const handleExport = () => {
        const dataStr = JSON.stringify(clients, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `clientes_export_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const parsedData = await parseImportFile(file, 'customers');

            const newItems: Customer[] = [];
            const updatedItems: Customer[] = [];
            const simulatedState = [...clients];

            parsedData.forEach(importedClient => {
                // Match by Email or Name
                const existingIndex = simulatedState.findIndex(c =>
                    (c.email && c.email.toLowerCase() === importedClient.email.toLowerCase()) ||
                    c.name.toLowerCase() === importedClient.name.toLowerCase()
                );

                if (existingIndex >= 0) {
                    // Simulate update for review
                    updatedItems.push({ ...simulatedState[existingIndex], ...importedClient, id: simulatedState[existingIndex].id });
                } else {
                    newItems.push(importedClient);
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
        if (importSummary.newItems.length > 0) {
            const newPayload = importSummary.newItems.map(item => ({
                name: item.name,
                email: item.email || null,
                phone: item.phone || null,
                address: item.address || null,
                city: item.city || null
            }));
            const { error } = await supabase.from("customers").insert(newPayload);
            if (error) {
                alert("Erro ao inserir clientes: " + error.message);
                return;
            }
        }

        // Update existing items
        for (const update of importSummary.updatedItems) {
            const { error } = await supabase
                .from("customers")
                .update({
                    name: update.name,
                    email: update.email || null,
                    phone: update.phone || null,
                    address: update.address || null,
                    city: update.city || null
                })
                .eq("id", update.id);
            if (error) {
                console.error("Erro ao atualizar cliente:", error);
            }
        }

        setReviewOpen(false);
        fetchClients();
        alert("Importação de Clientes concluída!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">
                        Gerencie sua base de clientes.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json,.pdf,.csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                    />
                    <Button variant="outline" className="gap-2" onClick={handleImportClick}>
                        <Upload className="h-4 w-4" /> Importar
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" /> Exportar
                    </Button>
                    <Button className="gap-2" onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4" /> Novo Cliente
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar clientes..."
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
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contato</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Localização</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{client.name}</span>
                                            <span className="text-xs text-muted-foreground">ID: #{client.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col gap-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span>{client.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span>{client.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span>{client.address} - {client.city}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(client)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(client.id)}>
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
                        <DialogTitle>{currentClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                        <DialogDescription>
                            Preencha as informações do cliente abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Telefone
                            </Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Endereço
                            </Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">
                                Cidade
                            </Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" onClick={handleSave}>Salvar</Button>
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
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Telefone' },
                    { key: 'city', label: 'Cidade' }
                ]}
            />
        </div>
    );
}
