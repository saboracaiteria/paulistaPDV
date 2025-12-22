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
import { BarChart3, TrendingUp, Package, Users, Receipt, CalendarRange, Loader2, Printer } from "lucide-react";

const REPORTS = [
    {
        category: "Vendas",
        items: [
            { icon: TrendingUp, title: "Vendas por Período", desc: "Análise detalhada de faturamento diário, semanal ou mensal." },
            { icon: Users, title: "Vendas por Vendedor", desc: "Desempenho individual e comissões da equipe." },
            { icon: Receipt, title: "Ticket Médio", desc: "Evolução do valor médio gasto por cliente." },
        ]
    },
    {
        category: "Estoque",
        items: [
            { icon: Package, title: "Produtos Mais Vendidos", desc: "Curva ABC de produtos e movimentação." },
            { icon: Package, title: "Estoque Baixo", desc: "Relatório de reposição e produtos zerados." },
            { icon: Package, title: "Inventário Valorizado", desc: "Valor total do estoque atual a preço de custo e venda." },
        ]
    },
    {
        category: "Financeiro",
        items: [
            { icon: CalendarRange, title: "Fluxo de Caixa", desc: "Entradas e saídas detalhadas por conta." },
            { icon: CalendarRange, title: "DRE Gerencial", desc: "Demonstrativo de Resultados do Exercício." },
        ]
    }
];

export default function ReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);
    const [reportPreview, setReportPreview] = useState<{ title: string; content: string } | null>(null);

    const handleGenerateReport = (title: string) => {
        setGenerating(title);
        // Simulate processing
        setTimeout(() => {
            setGenerating(null);

            // Generate mock content based on title
            let content = "";
            const date = new Date().toLocaleDateString();
            if (title.includes("Vendas")) {
                content = `Período: ${date}\nTotal de Vendas: 145\nFaturamento: R$ 23.450,00\nTicket Médio: R$ 161,72`;
            } else if (title.includes("Estoque")) {
                content = `Data do Inventário: ${date}\nItens em Estoque: 1.250\nItens Críticos: 15\nValor Total (Custo): R$ 45.000,00`;
            } else if (title.includes("Financeiro")) {
                content = `Competência: Dezembro/2025\nReceitas: R$ 56.000,00\nDespesas: R$ 32.000,00\nResultado Operacional: R$ 24.000,00`;
            } else {
                content = `Relatório gerado em: ${date}\nConteúdo simulado para fins de demonstração.\nTodos os indicadores estão positivos.`;
            }

            setReportPreview({ title, content });
        }, 1500);
    };

    const handlePrint = () => {
        window.print();
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
                                            onClick={() => handleGenerateReport(item.title)}
                                            disabled={generating === item.title}
                                        >
                                            {generating === item.title ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Gerando...
                                                </>
                                            ) : (
                                                "Gerar Relatório \u2192"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* PREVIEW DIALOG */}
            <Dialog open={!!reportPreview} onOpenChange={(open) => !open && setReportPreview(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Relatório Pronto</DialogTitle>
                        <DialogDescription>
                            O relatório <strong>{reportPreview?.title}</strong> foi gerado com sucesso.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-line">
                        {reportPreview?.content}
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <div className="flex-1"></div> {/* Spacer */}
                        <Button variant="outline" onClick={() => setReportPreview(null)}>Fechar</Button>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Imprimir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
