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
import { Printer, Save, Database, Shield, Store } from "lucide-react";

export default function SettingsPage() {
    const [storeSettings, setStoreSettings] = useState({
        storeName: "Paulista Construção e Varejo",
        legalName: "Paulista Mat e Cons LTDA",
        cnpj: "12.345.678/0001-90",
        ie: "123.456.789.111",
        address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
    });

    useEffect(() => {
        const saved = localStorage.getItem("eptus_store_settings");
        if (saved) {
            setStoreSettings(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStoreSettings({
            ...storeSettings,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        localStorage.setItem("eptus_store_settings", JSON.stringify(storeSettings));
        alert("Configurações salvas com sucesso!");
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
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button className="gap-2" onClick={handleSave}>
                                <Save className="h-4 w-4" /> Salvar
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
                            <Button>Testar Impressão</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="backup" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Backup e Restauração
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
                                        Realizado diariamente às 03:00
                                    </div>
                                </div>
                                <Button variant="outline">Configurar</Button>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Backup Manual</h4>
                                <div className="flex gap-4">
                                    <Button className="w-full sm:w-auto">
                                        Fazer Backup Agora
                                    </Button>
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        Restaurar Backup
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
