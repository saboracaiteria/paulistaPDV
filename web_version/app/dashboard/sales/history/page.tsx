"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Search,
    Eye,
    Printer,
    XCircle,
    RefreshCcw,
    Loader2,
    Calendar,
    DollarSign,
    User,
    ShoppingBag,
    Clock,
} from "lucide-react";

interface Sale {
    id: number;
    customer_name: string;
    customer_phone: string | null;
    payment_method: string;
    payment_condition: string;
    subtotal: number;
    discount: number;
    total: number;
    items: { name: string; quantity: number; price: number }[];
    created_at: string;
    status?: string;
}

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [canceling, setCanceling] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getPaymentLabel = (method: string) => {
        const labels: Record<string, string> = {
            'dinheiro': 'Dinheiro',
            'pix': 'PIX',
            'cartão débito': 'Cartão Débito',
            'cartão crédito': 'Cartão Crédito',
            'duplicata': 'Duplicata',
        };
        return labels[method] || method;
    };

    const fetchSales = async () => {
        setLoading(true);
        let query = supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (dateFilter) {
            const startDate = new Date(dateFilter);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateFilter);
            endDate.setHours(23, 59, 59, 999);
            query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
        }

        const { data, error } = await query;

        if (data && !error) {
            setSales(data as Sale[]);
        } else {
            console.error('Error fetching sales:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSales();
    }, [dateFilter]);

    const filteredSales = sales.filter(sale =>
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm)
    );

    const handleViewDetails = (sale: Sale) => {
        setSelectedSale(sale);
        setShowDetailsModal(true);
    };

    const handlePrintReceipt = (sale: Sale) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Bloqueador de pop-up impediu a impressão');
            return;
        }

        const items = Array.isArray(sale.items) ? sale.items : [];

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cupom - Venda #${sale.id}</title>
                <style>
                    body { font-family: monospace; font-size: 12px; max-width: 300px; margin: 0 auto; padding: 10px; }
                    .center { text-align: center; }
                    .divider { border-top: 1px dashed #000; margin: 8px 0; }
                    .item { display: flex; justify-content: space-between; margin: 4px 0; }
                    .total { font-size: 14px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="center"><strong>PAULISTA PDV</strong></div>
                <div class="center">Cupom Não Fiscal</div>
                <div class="divider"></div>
                <div>Venda: #${sale.id}</div>
                <div>Data: ${formatDate(sale.created_at)}</div>
                <div>Cliente: ${sale.customer_name || 'Consumidor Final'}</div>
                <div class="divider"></div>
                <div><strong>ITENS:</strong></div>
                ${items.map(item => `
                    <div class="item">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                <div class="divider"></div>
                <div class="item"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
                ${sale.discount > 0 ? `<div class="item"><span>Desconto:</span><span>-${formatCurrency(sale.discount)}</span></div>` : ''}
                <div class="item total"><span>TOTAL:</span><span>${formatCurrency(sale.total)}</span></div>
                <div class="divider"></div>
                <div>Pagamento: ${getPaymentLabel(sale.payment_method)}</div>
                <div class="center" style="margin-top: 20px;">Obrigado pela preferência!</div>
            </body>
            </html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleCancelSale = async () => {
        if (!selectedSale) return;
        setCanceling(true);

        // Update sale status to cancelled
        const { error } = await supabase
            .from('sales')
            .update({ status: 'cancelled' })
            .eq('id', selectedSale.id);

        if (error) {
            toast.error('Erro ao cancelar venda: ' + error.message);
        } else {
            toast.success('Venda cancelada com sucesso!');
            fetchSales();
        }

        setCanceling(false);
        setShowCancelModal(false);
        setSelectedSale(null);
    };

    const totalSalesValue = filteredSales
        .filter(s => s.status !== 'cancelled')
        .reduce((acc, s) => acc + Number(s.total), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Histórico de Vendas</h1>
                <p className="text-muted-foreground">
                    Consulte, reimprima ou cancele vendas realizadas.
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente ou número..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="pl-9 w-[180px]"
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchSales}>
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredSales.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSalesValue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(filteredSales.length > 0 ? totalSalesValue / filteredSales.length : 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sales List */}
            <Card>
                <CardHeader>
                    <CardTitle>Vendas {dateFilter && `de ${new Date(dateFilter).toLocaleDateString('pt-BR')}`}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredSales.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhuma venda encontrada.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredSales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors",
                                        sale.status === 'cancelled' && "opacity-50 bg-rose-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ShoppingBag className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">#{sale.id}</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span>{sale.customer_name || 'Consumidor Final'}</span>
                                                {sale.status === 'cancelled' && (
                                                    <Badge variant="destructive">Cancelada</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(sale.created_at)}
                                                <span>•</span>
                                                {getPaymentLabel(sale.payment_method)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-emerald-600">{formatCurrency(sale.total)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {Array.isArray(sale.items) ? sale.items.length : 0} item(s)
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(sale)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handlePrintReceipt(sale)}>
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                            {sale.status !== 'cancelled' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-rose-500 hover:text-rose-600"
                                                    onClick={() => {
                                                        setSelectedSale(sale);
                                                        setShowCancelModal(true);
                                                    }}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Venda #{selectedSale?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Cliente</Label>
                                    <p className="font-medium">{selectedSale.customer_name || 'Consumidor Final'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Data/Hora</Label>
                                    <p className="font-medium">{formatDate(selectedSale.created_at)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Pagamento</Label>
                                    <p className="font-medium">{getPaymentLabel(selectedSale.payment_method)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Condição</Label>
                                    <p className="font-medium">{selectedSale.payment_condition?.replace(/_/g, ' ') || 'À Vista'}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Itens</Label>
                                <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
                                    {Array.isArray(selectedSale.items) && selectedSale.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm p-2 bg-muted rounded">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-1">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                                </div>
                                {selectedSale.discount > 0 && (
                                    <div className="flex justify-between text-rose-600">
                                        <span>Desconto:</span>
                                        <span>-{formatCurrency(selectedSale.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-emerald-600">{formatCurrency(selectedSale.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Fechar</Button>
                        <Button onClick={() => selectedSale && handlePrintReceipt(selectedSale)}>
                            <Printer className="h-4 w-4 mr-2" /> Reimprimir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Modal */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-rose-600">Cancelar Venda</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja cancelar a venda #{selectedSale?.id}?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            Não, manter venda
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSale} disabled={canceling}>
                            {canceling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sim, cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
