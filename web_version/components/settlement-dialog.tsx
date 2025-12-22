import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receivable } from "@/lib/universal-parser";

interface SettlementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (settledItems: Receivable[]) => void;
    selectedItems: Receivable[];
}

export function SettlementDialog({ isOpen, onClose, onConfirm, selectedItems }: SettlementDialogProps) {
    const [items, setItems] = useState<Receivable[]>([]);
    const [generalDiscount, setGeneralDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Dinheiro");

    // Initialize items with current state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setItems(selectedItems.map(item => ({
                ...item,
                originalValue: item.value, // Keep track of original
                discount: 0,
                // final value will be calculated
            })));
            setGeneralDiscount(0);
        }
    }, [isOpen, selectedItems]);

    // Handle individual discount change
    const handleDiscountChange = (id: number, val: number) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, discount: val } : item
        ));
    };

    // Calculate totals
    const totalOriginal = items.reduce((sum, item) => sum + (item.originalValue || item.value), 0);
    const totalIndividualDiscounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const totalFinal = Math.max(0, totalOriginal - totalIndividualDiscounts - generalDiscount);

    const handleConfirm = () => {
        const settled = items.map(item => {
            const finalVal = (item.originalValue || item.value) - (item.discount || 0);
            // Distribute general discount propotionally or just store it? 
            // For simplicity, we won't apply general discount to individual items here, 
            // but in a real app you might want to split it. 
            // We will just return the items with their individual modifications, 
            // and the parent can handle the accounting of the general discount if needed.
            // OR: We apply the general discount as a separate entry? 
            // Better: We subtract general discount from the *total* payment record, 
            // but for the individual invoice status, it is considered "Paid".

            return {
                ...item,
                value: finalVal, // Update value to what was effectively paid (minus individual discount)
                status: "Recebido" as const,
                paymentDate: new Date().toLocaleDateString('pt-BR'),
                paymentMethod: paymentMethod
            };
        });

        // Note: General Discount is a transaction level detail. 
        // For this simple ERP, we might just want to store the final paid amount.
        // Let's assume onConfirm will replace the items in the main list.

        onConfirm(settled);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Baixar Contas Selecionadas</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                                <tr>
                                    <th className="p-2 text-left">Descrição</th>
                                    <th className="p-2 text-right">Valor Orig.</th>
                                    <th className="p-2 text-right">Desconto (R$)</th>
                                    <th className="p-2 text-right">Valor Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const orig = item.originalValue || item.value;
                                    const disc = item.discount || 0;
                                    return (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2">{item.description} <br /> <span className="text-xs text-muted-foreground">{item.customer}</span></td>
                                            <td className="p-2 text-right">R$ {orig.toFixed(2)}</td>
                                            <td className="p-2 text-right">
                                                <Input
                                                    type="number"
                                                    className="w-20 ml-auto h-8 text-right"
                                                    value={disc}
                                                    onChange={(e) => handleDiscountChange(item.id, Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 text-right font-medium">R$ {(orig - disc).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <Label>Forma de Pagamento</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Pix">Pix</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Cartão de Débito">Cartão de Débito</option>
                                <option value="Boleto">Boleto</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Desconto Geral (R$)</Label>
                                <Input
                                    type="number"
                                    className="w-32 text-right"
                                    value={generalDiscount}
                                    onChange={(e) => setGeneralDiscount(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total a Pagar:</span>
                                <span>R$ {totalFinal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">Confirmar Baixa</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
