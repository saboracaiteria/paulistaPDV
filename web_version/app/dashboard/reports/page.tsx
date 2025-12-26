"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { BarChart3, TrendingUp, Package, Users, Receipt, CalendarRange, Loader2, Printer, Wallet, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReportResult {
    title: string;
    content: string;
    data?: Record<string, unknown>[];
}

const REPORTS = [
    {
        category: "Vendas",
        items: [
            { icon: TrendingUp, title: "Vendas por Período", desc: "Análise detalhada de faturamento diário, semanal ou mensal.", hasDateFilter: true },
            { icon: Receipt, title: "Ticket Médio", desc: "Evolução do valor médio gasto por cliente.", hasDateFilter: true },
        ]
    },
    {
        category: "Estoque",
        items: [
            { icon: Package, title: "Produtos Mais Vendidos", desc: "Ranking dos produtos mais vendidos.", hasDateFilter: true },
            { icon: Package, title: "Estoque Baixo", desc: "Relatório de produtos com estoque crítico.", hasDateFilter: false },
            { icon: Package, title: "Inventário Valorizado", desc: "Valor total do estoque atual.", hasDateFilter: false },
        ]
    },
    {
        category: "Financeiro",
        items: [
            { icon: Wallet, title: "Fluxo de Caixa", desc: "Movimentações do caixa por período.", hasDateFilter: true },
            { icon: CalendarRange, title: "Contas a Receber", desc: "Resumo de valores pendentes e recebidos.", hasDateFilter: false },
        ]
    }
];

export default function ReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);
    const [reportPreview, setReportPreview] = useState<ReportResult | null>(null);
    const [dateFilter, setDateFilter] = useState<{ title: string; startDate: string; endDate: string } | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const generateVendasPorPeriodo = async (startDate: string, endDate: string) => {
        const { data: sales } = await supabase
            .from('sales')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59')
            .order('created_at', { ascending: false });

        const totalVendas = sales?.length || 0;
        const faturamento = sales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
        const descontos = sales?.reduce((acc, s) => acc + Number(s.discount || 0), 0) || 0;

        // Agrupar por método de pagamento
        const byMethod: Record<string, number> = {};
        sales?.forEach(s => {
            const method = s.payment_method || 'Não informado';
            byMethod[method] = (byMethod[method] || 0) + Number(s.total);
        });

        let content = `📅 Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}\n\n`;
        content += `📊 RESUMO DE VENDAS\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `Total de Vendas: ${totalVendas}\n`;
        content += `Faturamento Bruto: ${formatCurrency(faturamento)}\n`;
        content += `Descontos Concedidos: ${formatCurrency(descontos)}\n`;
        content += `Faturamento Líquido: ${formatCurrency(faturamento - descontos)}\n\n`;
        content += `💳 POR FORMA DE PAGAMENTO\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        Object.entries(byMethod).forEach(([method, value]) => {
            content += `${method}: ${formatCurrency(value)}\n`;
        });

        return { title: "Vendas por Período", content };
    };

    const generateTicketMedio = async (startDate: string, endDate: string) => {
        const { data: sales } = await supabase
            .from('sales')
            .select('total, customer_name')
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59');

        const totalVendas = sales?.length || 0;
        const faturamento = sales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
        const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;

        // Agrupar por cliente
        const byCustomer: Record<string, { count: number; total: number }> = {};
        sales?.forEach(s => {
            const customer = s.customer_name || 'Consumidor Final';
            if (!byCustomer[customer]) byCustomer[customer] = { count: 0, total: 0 };
            byCustomer[customer].count++;
            byCustomer[customer].total += Number(s.total);
        });

        const topCustomers = Object.entries(byCustomer)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5);

        let content = `📅 Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}\n\n`;
        content += `📊 TICKET MÉDIO\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `Total de Vendas: ${totalVendas}\n`;
        content += `Faturamento Total: ${formatCurrency(faturamento)}\n`;
        content += `Ticket Médio: ${formatCurrency(ticketMedio)}\n\n`;
        content += `👥 TOP 5 CLIENTES\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        topCustomers.forEach(([name, data], i) => {
            content += `${i + 1}. ${name}: ${data.count} compras - ${formatCurrency(data.total)}\n`;
        });

        return { title: "Ticket Médio", content };
    };

    const generateProdutosMaisVendidos = async (startDate: string, endDate: string) => {
        const { data: sales } = await supabase
            .from('sales')
            .select('items')
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59');

        // Agregar produtos
        const products: Record<string, { name: string; quantity: number; total: number }> = {};
        sales?.forEach(sale => {
            const items = sale.items as { name: string; quantity: number; price: number }[];
            items?.forEach(item => {
                const key = item.name;
                if (!products[key]) products[key] = { name: item.name, quantity: 0, total: 0 };
                products[key].quantity += item.quantity;
                products[key].total += item.quantity * item.price;
            });
        });

        const topProducts = Object.values(products)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 15);

        let content = `📅 Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}\n\n`;
        content += `🏆 PRODUTOS MAIS VENDIDOS\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        if (topProducts.length === 0) {
            content += `Nenhuma venda no período.\n`;
        } else {
            topProducts.forEach((p, i) => {
                content += `${i + 1}. ${p.name}\n`;
                content += `   Qtd: ${p.quantity} | Total: ${formatCurrency(p.total)}\n`;
            });
        }

        return { title: "Produtos Mais Vendidos", content };
    };

    const generateEstoqueBaixo = async () => {
        const { data: products } = await supabase
            .from('products')
            .select('name, stock, category, price')
            .lt('stock', 10)
            .order('stock', { ascending: true })
            .limit(30);

        let content = `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
        content += `⚠️ PRODUTOS COM ESTOQUE BAIXO (< 10 un)\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (!products || products.length === 0) {
            content += `✅ Nenhum produto com estoque crítico!\n`;
        } else {
            content += `Total: ${products.length} produto(s)\n\n`;
            products.forEach((p, i) => {
                const status = p.stock === 0 ? '🔴 ZERADO' : p.stock < 5 ? '🟡 CRÍTICO' : '🟢 BAIXO';
                content += `${i + 1}. ${p.name}\n`;
                content += `   Estoque: ${p.stock} | ${status}\n`;
            });
        }

        return { title: "Estoque Baixo", content };
    };

    const generateInventarioValorizado = async () => {
        const { data: products } = await supabase
            .from('products')
            .select('name, stock, price, category');

        const totalItems = products?.reduce((acc, p) => acc + Number(p.stock || 0), 0) || 0;
        const totalValue = products?.reduce((acc, p) => acc + (Number(p.stock || 0) * Number(p.price || 0)), 0) || 0;

        // Agrupar por categoria
        const byCategory: Record<string, { count: number; value: number }> = {};
        products?.forEach(p => {
            const cat = p.category || 'Sem Categoria';
            if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
            byCategory[cat].count += Number(p.stock || 0);
            byCategory[cat].value += Number(p.stock || 0) * Number(p.price || 0);
        });

        let content = `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
        content += `📦 INVENTÁRIO VALORIZADO\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `Total de Itens: ${totalItems.toLocaleString('pt-BR')}\n`;
        content += `Valor Total (Venda): ${formatCurrency(totalValue)}\n\n`;
        content += `📂 POR CATEGORIA\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        Object.entries(byCategory)
            .sort((a, b) => b[1].value - a[1].value)
            .forEach(([cat, data]) => {
                content += `${cat}: ${data.count} itens - ${formatCurrency(data.value)}\n`;
            });

        return { title: "Inventário Valorizado", content };
    };

    const generateFluxoCaixa = async (startDate: string, endDate: string) => {
        const { data: movements } = await supabase
            .from('cash_movements')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59')
            .order('created_at', { ascending: false });

        const totals: Record<string, number> = {
            opening: 0,
            sale: 0,
            suprimento: 0,
            sangria: 0,
            closing: 0,
        };

        movements?.forEach(m => {
            totals[m.type] = (totals[m.type] || 0) + Number(m.amount);
        });

        const entradas = totals.opening + totals.sale + totals.suprimento;
        const saidas = totals.sangria;
        const saldo = entradas - saidas;

        let content = `📅 Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}\n\n`;
        content += `💰 FLUXO DE CAIXA\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `Movimentações: ${movements?.length || 0}\n\n`;
        content += `📥 ENTRADAS\n`;
        content += `  Aberturas: ${formatCurrency(totals.opening)}\n`;
        content += `  Vendas: ${formatCurrency(totals.sale)}\n`;
        content += `  Suprimentos: ${formatCurrency(totals.suprimento)}\n`;
        content += `  Total: ${formatCurrency(entradas)}\n\n`;
        content += `📤 SAÍDAS\n`;
        content += `  Sangrias: ${formatCurrency(totals.sangria)}\n\n`;
        content += `💵 SALDO: ${formatCurrency(saldo)}`;

        return { title: "Fluxo de Caixa", content };
    };

    const generateContasReceber = async () => {
        const { data: receivables } = await supabase
            .from('receivables')
            .select('*')
            .order('due_date', { ascending: true });

        const pendentes = receivables?.filter(r => r.status === 'Pendente') || [];
        const recebidos = receivables?.filter(r => r.status === 'Recebido') || [];
        const atrasados = receivables?.filter(r => r.status === 'Atrasado') || [];

        const totalPendente = pendentes.reduce((acc, r) => acc + Number(r.value), 0);
        const totalRecebido = recebidos.reduce((acc, r) => acc + Number(r.value), 0);
        const totalAtrasado = atrasados.reduce((acc, r) => acc + Number(r.value), 0);

        let content = `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
        content += `💳 CONTAS A RECEBER\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `🟡 Pendentes: ${pendentes.length} - ${formatCurrency(totalPendente)}\n`;
        content += `🔴 Atrasados: ${atrasados.length} - ${formatCurrency(totalAtrasado)}\n`;
        content += `🟢 Recebidos: ${recebidos.length} - ${formatCurrency(totalRecebido)}\n\n`;
        content += `📋 Total Geral: ${formatCurrency(totalPendente + totalAtrasado + totalRecebido)}\n`;
        content += `📋 A Receber: ${formatCurrency(totalPendente + totalAtrasado)}`;

        return { title: "Contas a Receber", content };
    };

    const handleGenerateReport = async (title: string, hasDateFilter: boolean) => {
        if (hasDateFilter) {
            const today = new Date().toISOString().slice(0, 10);
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
            setDateFilter({ title, startDate: firstDay, endDate: today });
            return;
        }

        setGenerating(title);
        try {
            let result: ReportResult | null = null;

            switch (title) {
                case "Estoque Baixo":
                    result = await generateEstoqueBaixo();
                    break;
                case "Inventário Valorizado":
                    result = await generateInventarioValorizado();
                    break;
                case "Contas a Receber":
                    result = await generateContasReceber();
                    break;
            }

            if (result) setReportPreview(result);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Erro ao gerar relatório');
        }
        setGenerating(null);
    };

    const handleGenerateWithDates = async () => {
        if (!dateFilter) return;
        setGenerating(dateFilter.title);

        try {
            let result: ReportResult | null = null;

            switch (dateFilter.title) {
                case "Vendas por Período":
                    result = await generateVendasPorPeriodo(dateFilter.startDate, dateFilter.endDate);
                    break;
                case "Ticket Médio":
                    result = await generateTicketMedio(dateFilter.startDate, dateFilter.endDate);
                    break;
                case "Produtos Mais Vendidos":
                    result = await generateProdutosMaisVendidos(dateFilter.startDate, dateFilter.endDate);
                    break;
                case "Fluxo de Caixa":
                    result = await generateFluxoCaixa(dateFilter.startDate, dateFilter.endDate);
                    break;
            }

            if (result) setReportPreview(result);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Erro ao gerar relatório');
        }

        setGenerating(null);
        setDateFilter(null);
    };

    const handlePrint = () => {
        window.print();
    };

    // ===== EXPORTAÇÃO CSV =====
    const handleExportCSV = () => {
        if (!reportPreview) return;

        // Limpar caracteres especiais e formatar para CSV
        let csvContent = reportPreview.content
            .replace(/━/g, '-')
            .replace(/📅|📊|💳|🏆|⚠️|✅|🔴|🟡|🟢|💰|📥|📤|💵|📋|📂|📦/g, '')
            .trim();

        // Criar blob e fazer download
        const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `relatorio_${reportPreview.title.toLowerCase().replace(/ /g, '_').replace(/[áàãâ]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòõô]/g, 'o').replace(/[úùû]/g, 'u')}_${new Date().toISOString().slice(0, 10)}.txt`;

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
                <p className="text-muted-foreground">
                    Análises e insights sobre o desempenho do negócio.
                </p>
            </div>

            <div className="grid gap-6">
                {REPORTS.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight border-b pb-2">
                            {section.category}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {section.items.map((item, i) => (
                                <Card key={i} className="hover:bg-accent/50 transition-colors cursor-pointer group">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            {item.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {item.desc}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start pl-0 group-hover:pl-2 transition-all"
                                            onClick={() => handleGenerateReport(item.title, item.hasDateFilter)}
                                            disabled={generating === item.title}
                                        >
                                            {generating === item.title ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Gerando...
                                                </>
                                            ) : (
                                                "Gerar Relatório →"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Date Filter Dialog */}
            <Dialog open={!!dateFilter} onOpenChange={(open) => !open && setDateFilter(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Selecionar Período</DialogTitle>
                        <DialogDescription>
                            Informe o período para o relatório: {dateFilter?.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Data Inicial</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={dateFilter?.startDate || ''}
                                onChange={(e) => setDateFilter(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Data Final</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={dateFilter?.endDate || ''}
                                onChange={(e) => setDateFilter(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDateFilter(null)}>Cancelar</Button>
                        <Button onClick={handleGenerateWithDates} disabled={!!generating}>
                            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Gerar Relatório
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Preview Dialog */}
            <Dialog open={!!reportPreview} onOpenChange={(open) => !open && setReportPreview(null)}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Relatório Pronto</DialogTitle>
                        <DialogDescription>
                            O relatório <strong>{reportPreview?.title}</strong> foi gerado com sucesso.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-line max-h-[400px] overflow-y-auto">
                        {reportPreview?.content}
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                            <Download className="h-4 w-4" /> Exportar
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setReportPreview(null)}>Fechar</Button>
                            <Button onClick={handlePrint} className="gap-2">
                                <Printer className="h-4 w-4" /> Imprimir
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
