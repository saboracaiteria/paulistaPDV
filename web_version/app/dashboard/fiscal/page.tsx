"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FileText, AlertTriangle, CheckCircle, RefreshCcw } from "lucide-react";

export default function FiscalPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fiscal</h1>
                <p className="text-muted-foreground">
                    Gerenciamento de notas fiscais e certificado digital.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                            Ambiente NFC-e
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">Produção</div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-500">
                            Sistema operando normalmente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Série Atual
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">001</div>
                        <p className="text-xs text-muted-foreground">
                            Próxima Nota: #00018542
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400">
                            Certificado Digital
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-300">Vence em 45 dias</div>
                        <p className="text-xs text-amber-700 dark:text-amber-500">
                            CNPJ: 12.345.678/0001-90
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="settings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                    <TabsTrigger value="history">Histórico de Notas</TabsTrigger>
                    <TabsTrigger value="contingency">Contingência</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações de Emissão</CardTitle>
                            <CardDescription>
                                Dados da empresa e parâmetros fiscais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="csc">CSC (Código de Segurança)</Label>
                                    <Input id="csc" type="password" value="••••••••••••••••" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="csc-id">ID do CSC</Label>
                                    <Input id="csc-id" value="000001" readOnly />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="print-auto" />
                                <Label htmlFor="print-auto">Imprimir DANFE automaticamente após emissão</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="send-email" defaultChecked />
                                <Label htmlFor="send-email">Enviar XML/PDF por e-mail para o cliente</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Salvar Alterações</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimas Notas Emitidas</CardTitle>
                            <CardDescription>
                                Notas fiscais enviadas recentemente para a SEFAZ.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-3 font-medium">Número</th>
                                            <th className="p-3 font-medium">Data</th>
                                            <th className="p-3 font-medium">Valor</th>
                                            <th className="p-3 font-medium">Status</th>
                                            <th className="p-3 font-medium text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <tr key={i} className="hover:bg-muted/50">
                                                <td className="p-3">#0001854{1 - i}</td>
                                                <td className="p-3">Hoje, 1{i}:00</td>
                                                <td className="p-3">R$ {100 + i * 50},00</td>
                                                <td className="p-3">
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Autorizada</Badge>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Button variant="ghost" size="sm">Ver DANFE</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contingency" className="space-y-4">
                    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                Modo de Contingência
                            </CardTitle>
                            <CardDescription>
                                Ative apenas se os serviços da SEFAZ estiverem indisponíveis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-slate-950">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Contingência Offline</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Emite notas localmente para envio posterior.
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
