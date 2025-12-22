"use client";

import { useState, useRef, useMemo } from "react";
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
import { supabase } from "@/lib/supabase";
import { useEffect, useCallback } from "react";

export default function ProductsPage() {
    // Load products state
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);

    // Import Review State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [importSummary, setImportSummary] = useState<{ newItems: Product[], updatedItems: Product[] }>({ newItems: [], updatedItems: [] });
    const [pendingProducts, setPendingProducts] = useState<Product[]>([]);

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

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1, searchTerm); // Reset to page 1 on search
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch on page change (but not on search term change, that is handled above)
    // We need to be careful not to double fetch.
    useEffect(() => {
        // Only fetch if it wasn't triggered by search change just now.
        // Actually, simplest way is:
        fetchProducts(currentPage, searchTerm);
    }, [currentPage]);

    // Note: The above creates a double fetch on search change because setCurrentPage(1) triggers it.
    // Optimization: check if we should skip. But for now, correctness > perf optimization of 1 extra call.
    // Better pattern:

    const fetchProducts = async (page: number, search: string) => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*', { count: 'exact' });

            if (search) {
                // Search by ID or Name
                if (!isNaN(Number(search))) {
                    query = query.or(`id.eq.${search},name.ilike.%${search}%`);
                } else {
                    query = query.ilike('name', `%${search}%`);
                }
            }

            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            const { data, error, count } = await query
                .order('id', { ascending: true })
                .range(from, to);

            if (error) throw error;

            if (data) setProducts(data);
            if (count !== null) setTotalProducts(count);
        } catch (error) {
            console.error("Error fetching products:", error);
            // Silent error or toast
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Pagination (Server side count)
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    // Since we are server-side, currentProducts IS products
    const currentProducts = products;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Effect will trigger fetch
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
                // Update
                const { error } = await supabase
                    .from('products')
                    .update({
                        name: productToSave.name,
                        category: productToSave.category,
                        price: productToSave.price,
                        stock: productToSave.stock,
                        status: productToSave.status
                    })
                    .eq('id', currentProduct.id);

                if (error) throw error;

                // Optimistic update
                setProducts(products.map(p => p.id === currentProduct.id ? { ...productToSave, id: p.id } : p));
            } else {
                // Create
                const newId = Math.floor(Math.random() * 1000000); // Temporary ID generation strategy if not auto-increment
                // Better approach: Let DB handle ID or fetch max ID first. 
                // For this migration, we used 'id' as bigint primary key without auto-increment in the SQL provided? 
                // Wait, the SQL was `id bigint primary key`. If it's not generated by default, we need to generate it.
                // The `products-data.ts` had manual IDs. 
                // Let's assume we want to find the max ID to avoid collision.

                const { data: maxIdData } = await supabase
                    .from('products')
                    .select('id')
                    .order('id', { ascending: false })
                    .limit(1)
                    .single();

                const nextId = (maxIdData?.id || 0) + 1;

                const { error } = await supabase
                    .from('products')
                    .insert([{ ...productToSave, id: nextId }]);

                if (error) throw error;

                // Optimistic update
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
            try {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Erro ao excluir produto.");
            }
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
            const simulatedState = [...products];

            parsedData.forEach(item => {
                const existingIndex = simulatedState.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
                if (existingIndex >= 0) {
                    // Simulate update for review
                    updatedItems.push({ ...simulatedState[existingIndex], ...item, id: simulatedState[existingIndex].id });
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

    const confirmImport = () => {
        setProducts(prev => {
            const newState = [...prev];
            // Apply updates
            importSummary.updatedItems.forEach(update => {
                const index = newState.findIndex(p => p.id === update.id);
                if (index >= 0) newState[index] = update;
            });
            // Apply additions
            let maxId = Math.max(...newState.map(p => p.id), 0);
            importSummary.newItems.forEach(newItem => {
                maxId++;
                newState.unshift({ ...newItem, id: maxId }); // Add to top
            });
            return newState;
        });
        setReviewOpen(false);
        alert("Importação aplicada com sucesso!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
                    <p className="text-muted-foreground">
                        Gerencie seu catálogo, preços e estoque.
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
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" size="icon">
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
                                    <td className="p-4 align-middle font-medium">#{product.id}</td>
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{formatCurrency(product.price)}</td>
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
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
                                value={formData.name}
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
