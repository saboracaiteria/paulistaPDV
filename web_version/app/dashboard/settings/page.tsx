"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Printer, Save, Database, Store, Loader2, CheckCircle } from "lucide-react";
import { STORE_SETTINGS } from "@/lib/mock-data";
import { toast } from "sonner";

export default function SettingsPage() {
    const [storeSettings, setStoreSettings] = useState({
        storeName: "",
        legalName: "",
        cnpj: "",
        ie: "",
        address: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 600));

            setStoreSettings({
                storeName: STORE_SETTINGS.storeName,
                legalName: STORE_SETTINGS.legalName,
                cnpj: STORE_SETTINGS.cnpj,
                ie: STORE_SETTINGS.ie,
                address: STORE_SETTINGS.address
            });

            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStoreSettings({
            ...storeSettings,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSaving(false);
        setSaveSuccess(true);
        toast.success("Configurações salvas com sucesso (Simulação)!");

        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">
                    Personalize o sistema de acordo com sua necessidade.
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <div className="flex overflow-auto pb-2">
                    <TabsList>
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="devices">Dispositivos</TabsTrigger>
                        <TabsTrigger value="backup">Backup e Dados</TabsTrigger>
                        <TabsTrigger value="users">Usuários e Permissões</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Dados da Loja
                            </CardTitle>
                            <CardDescription>
                                Informações que aparecem nos cupons e relatórios.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="storeName">Nome Fantasia</Label>
                                        <Input
                                            id="storeName"
                                            name="storeName"
                                            value={storeSettings.storeName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="legalName">Razão Social</Label>
                                        <Input
                                            id="legalName"
                                            name="legalName"
                                            value={storeSettings.legalName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cnpj">CNPJ</Label>
                                        <Input
                                            id="cnpj"
                                            name="cnpj"
                                            value={storeSettings.cnpj}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ie">Inscrição Estadual</Label>
                                        <Input
                                            id="ie"
                                            name="ie"
                                            value={storeSettings.ie}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="address">Endereço Completo</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={storeSettings.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button className="gap-2" onClick={handleSave} disabled={saving || loading}>
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                                ) : saveSuccess ? (
                                    <><CheckCircle className="h-4 w-4 text-green-500" /> Salvo!</>
                                ) : (
                                    <><Save className="h-4 w-4" /> Salvar</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="devices" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Printer className="h-5 w-5" />
                                Impressoras e Periféricos
                            </CardTitle>
                            <CardDescription>
                                Configure a impressão de cupons e etiquetas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Impressora de Balcão (Não Fiscal)</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>POS-80 (Padrão)</option>
                                        <option>Bematech MP-4200</option>
                                        <option>Epson TM-T20</option>
                                        <option>Salvar em PDF</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Largura do Papel</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>80mm (Padrão)</option>
                                        <option>58mm</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button variant="outline">Testar Impressão</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="backup" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Backup e Dados
                            </CardTitle>
                            <CardDescription>
                                Mantenha seus dados seguros.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Backup Automático</div>
                                    <div className="text-sm text-muted-foreground">
                                        Indisponível na versão demo estática.
                                    </div>
                                </div>
                                <Button variant="outline" disabled>Configurar</Button>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Backup Manual</h4>
                                <div className="flex gap-4">
                                    <Button className="w-full sm:w-auto" disabled>
                                        Fazer Backup Agora
                                    </Button>
                                    <Button variant="outline" className="w-full sm:w-auto" disabled>
                                        Restaurar Backup
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200">
                                    Nota: Na versão demo estática, os dados não persistem entre sessões e backups não estão disponíveis.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usuários e Permissões</CardTitle>
                            <CardDescription>
                                Gerencie quem tem acesso ao sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Funcionalidade indisponível na versão demo.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
