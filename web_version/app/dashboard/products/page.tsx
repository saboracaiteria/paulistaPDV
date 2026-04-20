"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { PRODUCTS_DATA, Product } from "@/lib/products-data";
import { parseImportFile } from "@/lib/universal-parser";
import { ImportReviewDialog } from "@/components/import-review-dialog";

export default function ProductsPage() {
    // Load products state from static JSON
    const [products, setProducts] = useState<Product[]>(PRODUCTS_DATA);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Import Review State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Product[], updatedItems: Product[] }>({ newItems: [], updatedItems: [] });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        category: "Geral",
        price: 0,
        stock: 0,
        status: "Ativo"
    });

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;

        const lowerSearch = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.id.toString().includes(lowerSearch) ||
            p.category.toLowerCase().includes(lowerSearch)
        );
    }, [products, searchTerm]);

    // Pagination Logic
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setCurrentProduct(product);
            setFormData(product);
        } else {
            setCurrentProduct(null);
            setFormData({
                name: "",
                category: "Geral",
                price: 0,
                stock: 0,
                status: "Ativo"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        const productToSave = {
            ...formData,
            status: Number(formData.stock) <= 0 ? "Esgotado" : Number(formData.stock) < 5 ? "Baixo Estoque" : "Ativo",
        } as Product;

        try {
            if (currentProduct) {
                // Update local state
                setProducts(products.map(p => p.id === currentProduct.id ? { ...productToSave, id: p.id } : p));
            } else {
                // Create new ID (Max ID + 1)
                const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
                const nextId = maxId + 1;
                setProducts([{ ...productToSave, id: nextId }, ...products]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erro ao salvar produto.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    // --- Import/Export ---
    const handleExport = () => {
        const dataStr = JSON.stringify(products, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `produtos_export_${new Date().toISOString().slice(0, 10)}.json`;

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
            const parsedData = await parseImportFile(file, 'products');

            // Calculate Diff
            const newItems: Product[] = [];
            const updatedItems: Product[] = [];

            // Check against current products state
            parsedData.forEach(item => {
                const existingIndex = products.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
                if (existingIndex >= 0) {
                    updatedItems.push({ ...products[existingIndex], ...item, id: products[existingIndex].id });
                } else {
                    newItems.push(item);
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
        try {
            let maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;

            // Prepare new items with IDs
            const newItemsWithIds = importSummary.newItems.map(item => {
                maxId++;
                return { ...item, id: maxId };
            });

            // Update state: filter out items being updated, add updated items, add new items
            const updatedIds = new Set(importSummary.updatedItems.map(i => i.id));
            const productsWithoutUpdates = products.filter(p => !updatedIds.has(p.id));

            const newProductList = [
                ...newItemsWithIds,
                ...importSummary.updatedItems,
                ...productsWithoutUpdates
            ];

            // Sort by ID to keep consistent
            newProductList.sort((a, b) => a.id - b.id);

            setProducts(newProductList);
            setReviewOpen(false);
            alert(`Importação concluída! ${importSummary.newItems.length} novos, ${importSummary.updatedItems.length} atualizados.`);
        } catch (error) {
            console.error("Error importing products:", error);
            alert("Erro ao processar importação.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-wrap-balance">Produtos</h1>
                    <p className="text-muted-foreground">
                        Gerencie seu catálogo, preços e estoque (Modo Estático).
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
                        <Plus className="h-4 w-4" /> Novo Produto
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produtos…"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" size="icon" aria-label="Filtrar produtos">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoria</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Preço</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estoque</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {currentProducts.map((product) => (
                                <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium tabular-nums text-muted-foreground">#{product.id}</td>
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle tabular-nums">{formatCurrency(product.price)}</td>
                                    <td className="p-4 align-middle">{product.stock} un</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center text-xs font-medium ${product.status === "Ativo" ? "text-emerald-500" :
                                            product.status === "Esgotado" ? "text-red-500" : "text-amber-500"
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)} aria-label="Editar produto">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)} aria-label="Excluir produto">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between py-4 px-6 border-t">
                    <div className="text-xs text-muted-foreground">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, totalProducts)} de {totalProducts} produtos
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" /> Anterior
                        </Button>
                        <div className="text-sm font-medium">
                            Página {currentPage} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Próxima <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                        <DialogDescription>
                            Faça alterações no produto aqui. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Categoria
                            </Label>
                            <div className="col-span-3">
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Geral">Geral</option>
                                    <option value="Torneiras">Torneiras</option>
                                    <option value="Banheiro">Banheiro</option>
                                    <option value="Cozinha">Cozinha</option>
                                    <option value="Hidráulica">Hidráulica</option>
                                    <option value="Elétrica">Elétrica</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Preço (R$)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Estoque
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
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
                    { key: 'category', label: 'Categoria' },
                    { key: 'price', label: 'Preço' },
                    { key: 'stock', label: 'Estoque' }
                ]}
            />
        </div>
    );
}
