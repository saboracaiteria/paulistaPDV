"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, Edit2, Calculator, Save, X, Printer, Share2, FileText, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/products-data";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface CartItem extends Product {
    quantity: number;
    originalPrice: number;
    discount: number; // Discount in value
    discountType: "value" | "percent";
}

export default function SalesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    // Checkout State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("money");
    const [paymentCondition, setPaymentCondition] = useState("a_vista"); // Default condition
    const [clientName, setClientName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{
        product: Product | null;
        cartIndex: number | null;
        quantity: number;
        price: number;
        discount: number;
        discountType: "value" | "percent";
    }>({
        product: null,
        cartIndex: null,
        quantity: 1,
        price: 0,
        discount: 0,
        discountType: "value"
    });

    const [globalDiscount, setGlobalDiscount] = useState({ value: 0, type: "value" as "value" | "percent" });

    const listRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Refs for Edit Modal Navigation
    const editPriceRef = useRef<HTMLInputElement>(null);
    const editQuantityRef = useRef<HTMLInputElement>(null);
    const editDiscountRef = useRef<HTMLInputElement>(null);
    const editConfirmRef = useRef<HTMLButtonElement>(null);

    // Refs for Checkout Modal Navigation
    const checkoutClientRef = useRef<HTMLInputElement>(null);
    const checkoutWhatsappRef = useRef<HTMLInputElement>(null);
    const checkoutPrintRef = useRef<HTMLButtonElement>(null);

    // Fetch products
    // Fetch products (Server Side Search)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(searchTerm);
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchProducts = async (term: string) => {
        let query = supabase
            .from('products')
            .select('*')
            .limit(50); // Limit results for performance

        if (term) {
            const cleanTerm = term.trim();
            if (!isNaN(Number(cleanTerm))) {
                // Exact match for ID or searching in name
                query = query.or(`id.eq.${cleanTerm},name.ilike.%${cleanTerm}%`);
            } else {
                query = query.ilike('name', `%${cleanTerm}%`);
            }
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (data) setProducts(data);
    };

    // Filter products - No longer needed on client side since we fetch what we want
    const filteredProducts = products;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditModalOpen || isCheckoutOpen) return;

            if (e.key === "F5") {
                e.preventDefault();
                handleOpenCheckout();
                return;
            }

            if (document.activeElement?.tagName === "INPUT" && document.activeElement.getAttribute("name") === "search") {
                if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;
            }

            const currentIndex = filteredProducts.findIndex(p => p.id === selectedProductId);

            if (e.key === "ArrowDown") {
                e.preventDefault();
                const nextIndex = Math.min(currentIndex + 1, filteredProducts.length - 1);
                const nextId = filteredProducts[nextIndex]?.id;
                if (nextId) {
                    setSelectedProductId(nextId);
                    scrollToItem(nextIndex);
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const prevIndex = Math.max(currentIndex - 1, 0);
                const prevId = filteredProducts[prevIndex]?.id;
                if (prevId) {
                    setSelectedProductId(prevId);
                    scrollToItem(prevIndex);
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                // Ensure we use the current filtered list logic to find the product
                const product = filteredProducts.find(p => p.id === selectedProductId);
                if (product) openEditModal(product);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedProductId, filteredProducts, isEditModalOpen, isCheckoutOpen]);

    // Auto-focus logic for modals
    useEffect(() => {
        if (isEditModalOpen) {
            setTimeout(() => editPriceRef.current?.focus(), 100);
        }
    }, [isEditModalOpen]);

    useEffect(() => {
        if (isCheckoutOpen) {
            setTimeout(() => checkoutClientRef.current?.focus(), 100);
        }
    }, [isCheckoutOpen]);

    const scrollToItem = (index: number) => {
        if (listRef.current) {
            const item = listRef.current.children[index] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: "nearest" });
            }
        }
    };

    const openEditModal = (product: Product, cartIndex: number | null = null) => {
        if (cartIndex !== null) {
            const item = cart[cartIndex];
            setEditingItem({
                product: item,
                cartIndex: cartIndex,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                discountType: item.discountType
            });
        } else {
            setEditingItem({
                product: product,
                cartIndex: null,
                quantity: 1,
                price: product.price,
                discount: 0,
                discountType: "value"
            });
        }
        setIsEditModalOpen(true);
    };

    const handleSaveItem = () => {
        if (!editingItem.product) return;
        let finalPrice = editingItem.price; // Edited unit price

        const newItem: CartItem = {
            ...editingItem.product,
            quantity: editingItem.quantity,
            price: finalPrice,
            originalPrice: editingItem.product.price,
            discount: editingItem.discount,
            discountType: editingItem.discountType
        };

        if (editingItem.cartIndex !== null) {
            setCart(prev => {
                const newCart = [...prev];
                newCart[editingItem.cartIndex!] = newItem;
                return newCart;
            });
        } else {
            setCart(prev => [...prev, newItem]);
        }
        setIsEditModalOpen(false);
        setSearchTerm("");
        searchInputRef.current?.focus();
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const subTotal = cart.reduce((acc, item) => {
        let priceWithDisc = item.price;
        if (item.discount > 0) {
            if (item.discountType === "value") priceWithDisc = item.price - item.discount;
            else priceWithDisc = item.price * (1 - item.discount / 100);
        }
        return acc + (priceWithDisc * item.quantity);
    }, 0);

    const getFinalTotal = () => {
        let total = subTotal;
        if (globalDiscount.value > 0) {
            if (globalDiscount.type === "value") total -= globalDiscount.value;
            else total -= total * (globalDiscount.value / 100);
        }
        return Math.max(0, total);
    };

    const handleOpenCheckout = () => {
        if (cart.length === 0) {
            alert("O carrinho está vazio!");
            return;
        }
        setIsCheckoutOpen(true);
    };

    // --- Helpers ---
    const calculateInstallments = (total: number, condition: string) => {
        let count = 1;
        let daysLabels: string[] = ["A Vista"];

        switch (condition) {
            case "30_dias": count = 1; daysLabels = ["30 Dias"]; break;
            case "30_60_dias": count = 2; daysLabels = ["30 Dias", "60 Dias"]; break;
            case "30_60_90_dias": count = 3; daysLabels = ["30 Dias", "60 Dias", "90 Dias"]; break;
            case "30_60_90_120_dias": count = 4; daysLabels = ["30 Dias", "60 Dias", "90 Dias", "120 Dias"]; break;
            case "30_60_90_120_150_dias": count = 5; daysLabels = ["30", "60", "90", "120", "150 Dias"]; break;
            case "entrada_30_60": count = 3; daysLabels = ["Entrada", "30 Dias", "60 Dias"]; break;
            default: count = 1; daysLabels = ["A Vista"]; break; // a_vista
        }

        const baseValue = Math.floor((total / count) * 100) / 100;
        const remainder = Math.round((total - (baseValue * count)) * 100) / 100;

        return Array.from({ length: count }).map((_, i) => ({
            number: i + 1,
            value: i === count - 1 ? baseValue + remainder : baseValue,
            days: daysLabels[i] || `${(i + 1) * 30} Dias`
        }));
    };

    // --- Actions ---
    const generateReceiptText = () => {
        let text = `*COMPROVANTE DE VENDA*\n\n`;
        text += `Cliente: ${clientName || "Consumidor Final"}\n`;
        text += `Data: ${new Date().toLocaleString()}\n`;
        text += `--------------------------------\n`;
        cart.forEach(item => {
            text += `${item.quantity}x ${item.name}\n`;
            text += `   ${formatCurrency(item.price * item.quantity)}\n`;
        });
        text += `\n--------------------------------\n`;
        text += `Forma Pagto: ${selectedPayment.toUpperCase()}\n`;
        if (selectedPayment === 'duplicata' || selectedPayment === 'cartão crédito') {
            text += `Condição: ${paymentCondition.replace(/_/g, " ").toUpperCase()}\n`;
            text += `\nParcelas:\n`;
            const installments = calculateInstallments(getFinalTotal(), paymentCondition);
            installments.forEach(inst => {
                text += `${inst.number}a (${inst.days}): ${formatCurrency(inst.value)}\n`;
            });
        }
        text += `\n*TOTAL: ${formatCurrency(getFinalTotal())}*\n`;
        return text;
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(generateReceiptText());
        const number = whatsappNumber.replace(/\D/g, "");
        if (!number) {
            alert("Digite um número de WhatsApp válido.");
            return;
        }
        window.open(`https://wa.me/55${number}?text=${text}`, '_blank');
        setIsCheckoutOpen(false);
    };

    const handlePrint = () => {
        window.print(); // Simple print for now. A real app would open a print window with specific CSS.
        setIsCheckoutOpen(false);
        setCart([]); // Clear cart after "sale"
    };

    const handleBudget = () => {
        alert("Orçamento salvo com sucesso! (Simulação)");
        setIsCheckoutOpen(false);
    };

    // Generic Enter Navigation Handler
    const handleEnterKey = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement | null> | (() => void)) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (typeof nextRef === 'function') {
                nextRef();
            } else if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 focus:outline-none" tabIndex={0}>
            {/* EDIT ITEM MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Detalhes do Item</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Produto</Label>
                            <div className="col-span-3 font-semibold">{editingItem.product?.name}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Preço</Label>
                            <Input
                                ref={editPriceRef}
                                type="number"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                onKeyDown={(e) => handleEnterKey(e, editQuantityRef)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Qtd.</Label>
                            <Input
                                ref={editQuantityRef}
                                type="number"
                                value={editingItem.quantity}
                                onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                                onKeyDown={(e) => handleEnterKey(e, editDiscountRef)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Desconto</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    ref={editDiscountRef}
                                    type="number"
                                    value={editingItem.discount}
                                    onChange={(e) => setEditingItem({ ...editingItem, discount: Number(e.target.value) })}
                                    onKeyDown={(e) => handleEnterKey(e, handleSaveItem)}
                                />
                                <select className="border rounded p-1" value={editingItem.discountType} onChange={(e) => setEditingItem({ ...editingItem, discountType: e.target.value as "value" | "percent" })}>
                                    <option value="value">R$</option>
                                    <option value="percent">%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button ref={editConfirmRef} onClick={handleSaveItem}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CHECKOUT MODAL */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Finalizar Venda</DialogTitle>
                        <DialogDescription>Selecione a forma de pagamento e finalize.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cliente (Opcional)</Label>
                                <Input
                                    ref={checkoutClientRef}
                                    placeholder="Nome do cliente"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    onKeyDown={(e) => handleEnterKey(e, checkoutWhatsappRef)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp (Opcional)</Label>
                                <Input
                                    ref={checkoutWhatsappRef}
                                    placeholder="(00) 00000-0000"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    onKeyDown={(e) => handleEnterKey(e, checkoutPrintRef)}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'PIX', 'Duplicata'].map((method) => (
                                    <div
                                        key={method}
                                        onClick={() => setSelectedPayment(method.toLowerCase())}
                                        className={cn(
                                            "cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors hover:bg-slate-50",
                                            selectedPayment === method.toLowerCase() ? "border-primary bg-primary/10 text-primary" : "border-muted"
                                        )}
                                    >
                                        {method}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {(selectedPayment === 'duplicata' || selectedPayment === 'cartão crédito') && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label>Condição de Pagamento</Label>
                                    <Select value={paymentCondition} onValueChange={setPaymentCondition}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o parcelamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="a_vista">A Vista</SelectItem>
                                            <SelectItem value="30_dias">30 Dias</SelectItem>
                                            <SelectItem value="30_60_dias">30/60 Dias (2x)</SelectItem>
                                            <SelectItem value="30_60_90_dias">30/60/90 Dias (3x)</SelectItem>
                                            <SelectItem value="30_60_90_120_dias">30/60/90/120 Dias (4x)</SelectItem>
                                            <SelectItem value="30_60_90_120_150_dias">30/60/90/120/150 Dias (5x)</SelectItem>
                                            <SelectItem value="entrada_30_60">Entrada + 30/60 Dias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Installment Preview */}
                                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                                    <div className="font-semibold mb-2">Detalhamento das Parcelas:</div>
                                    <div className="space-y-1">
                                        {calculateInstallments(getFinalTotal(), paymentCondition).map((inst, idx) => (
                                            <div key={idx} className="flex justify-between">
                                                <span>{idx + 1}ª Parcela ({inst.days})</span>
                                                <span className="font-medium">{formatCurrency(inst.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg bg-slate-100 p-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>TOTAL A PAGAR</span>
                                <span className="text-green-600">{formatCurrency(getFinalTotal())}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <div className="flex gap-2 w-full sm:w-auto mr-auto">
                            <Button variant="outline" className="gap-2" onClick={handleBudget}>
                                <FileText className="h-4 w-4" />
                                Orçamento
                            </Button>
                            <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" onClick={handleWhatsApp}>
                                <Share2 className="h-4 w-4" />
                                WhatsApp
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)}>Voltar</Button>
                            <Button ref={checkoutPrintRef} className="gap-2 min-w-[140px]" onClick={handlePrint}>
                                <Printer className="h-4 w-4" />
                                Imprimir e Finalizar
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MAIN UI */}
            <div className="rounded-t-xl bg-slate-700 p-2 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5" />
                    <h2 className="font-bold text-lg">Busca Avançada (F2)</h2>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg text-slate-800 flex flex-col gap-3">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <input
                                ref={searchInputRef}
                                name="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-slate-400 rounded px-2 py-1 h-10 text-xl uppercase focus:ring-2 focus:ring-cyan-500 outline-none font-bold text-slate-700"
                                autoFocus
                                placeholder="DIGITE O NOME OU CÓDIGO..."
                                autoComplete="off"
                            />
                            <Search className="absolute right-3 top-2.5 h-6 w-6 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* List */}
                <div className="flex-1 flex flex-col border border-slate-300 bg-white rounded-lg shadow-sm overflow-hidden text-slate-800 font-sans">
                    <div className="bg-slate-200 border-b border-slate-300 grid grid-cols-12 gap-1 px-2 py-2 text-xs font-bold text-slate-700 uppercase">
                        <div className="col-span-1">Código</div>
                        <div className="col-span-1 text-center">Sts</div>
                        <div className="col-span-5">Descrição</div>
                        <div className="col-span-2">Categoria</div>
                        <div className="col-span-1 text-right">Preço</div>
                        <div className="col-span-2 text-center">Estoque</div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white" ref={listRef}>
                        {filteredProducts.slice(0, 100).map((product, index) => {
                            const isSelected = selectedProductId === product.id;
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProductId(product.id)}
                                    // Remove double click if we rely on F2/Enter mostly, but keeping it for mouse users
                                    onDoubleClick={() => openEditModal(product)}
                                    className={cn(
                                        "grid grid-cols-12 gap-1 px-2 py-1.5 text-xs border-b border-slate-100 cursor-pointer transition-colors items-center select-none",
                                        index % 2 === 0 ? "bg-slate-50" : "bg-white",
                                        isSelected ? "bg-[#00BCD4] text-black font-extrabold border-cyan-600" : "hover:bg-blue-50"
                                    )}
                                >
                                    <div className="col-span-1">{product.id}</div>
                                    <div className="col-span-1 text-center"><div className={cn("w-2 h-2 rounded-full mx-auto", product.stock > 0 ? "bg-green-500" : "bg-red-500")} /></div>
                                    <div className="col-span-5 truncate">{product.name}</div>
                                    <div className="col-span-2 truncate opacity-70">{product.category}</div>
                                    <div className="col-span-1 text-right font-mono">{formatCurrency(product.price)}</div>
                                    <div className="col-span-2 text-center">{product.stock}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="bg-slate-100 p-1 text-xs text-center text-slate-500 border-t">
                        Use as setas ↑ ↓ para navegar e ENTER para selecionar
                    </div>
                </div>

                {/* Cart */}
                <div className="w-96 flex flex-col border border-slate-300 bg-slate-50 rounded-lg shadow-sm">
                    <div className="p-3 bg-slate-800 text-white font-bold flex justify-between rounded-t-lg">
                        <span>CUPOM FISCAL</span>
                        <span>{cart.length.toString().padStart(2, '0')} ITENS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
                        {cart.map((item, idx) => {
                            let finalP = item.price;
                            if (item.discount > 0) {
                                if (item.discountType === 'value') finalP -= item.discount;
                                else finalP -= finalP * (item.discount / 100);
                            }
                            const total = finalP * item.quantity;
                            return (
                                <div key={idx} onClick={() => openEditModal(item, idx)} className="bg-white border border-slate-200 p-2 rounded shadow-sm text-sm hover:border-cyan-400 cursor-pointer relative group">
                                    <div className="font-bold text-slate-800 truncate pr-6">{item.name}</div>
                                    <div className="flex justify-between items-center mt-1 text-xs text-slate-600">
                                        <div>{item.quantity} x {formatCurrency(item.price)}</div>
                                        <div className="font-bold text-lg text-slate-900">{formatCurrency(total)}</div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(idx); }} className="absolute top-1 right-1 text-slate-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                                </div>
                            )
                        })}
                        {cart.length === 0 && (
                            <div className="text-center text-slate-400 py-10">Carrinho Vazio</div>
                        )}
                    </div>

                    <div className="bg-white border-t p-4 space-y-3">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">DESCONTO:</span>
                            <div className="flex gap-1 w-24">
                                <input className="w-full border rounded px-1 text-right text-xs" value={globalDiscount.value} type="number" onChange={(e) => setGlobalDiscount({ ...globalDiscount, value: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-slate-800">TOTAL</span>
                                <span className="text-3xl font-extrabold text-blue-600">{formatCurrency(getFinalTotal())}</span>
                            </div>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg shadow-lg" onClick={handleOpenCheckout}>
                            FINALIZAR (F5)
                        </Button>
                    </div>
                </div>
            </div>
            {/* Using inline separator for simplicity/robustness as earlier */}
            <div className="hidden"><Separator /></div>
        </div>
    );
}

function Separator() {
    return <div className="h-[1px] w-full bg-slate-200 my-4" />
}
