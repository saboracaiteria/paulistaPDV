"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ImportReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    summary: {
        newItems: any[];
        updatedItems: any[];
    };
    columns: { key: string; label: string }[]; // To render table generically
}

export function ImportReviewDialog({
    isOpen,
    onClose,
    onConfirm,
    summary,
    columns
}: ImportReviewDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Revisar Importação</DialogTitle>
                    <DialogDescription>
                        Verifique os dados antes de confirmar. Nenhuma alteração foi feita ainda.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="new" className="h-full flex flex-col">
                        <TabsList>
                            <TabsTrigger value="new" className="gap-2">
                                Novos Registros
                                <Badge variant="secondary">{summary.newItems.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="updated" className="gap-2">
                                Atualizações
                                <Badge variant="secondary">{summary.updatedItems.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="new" className="flex-1 border rounded-md mt-2 relative overflow-hidden">
                            <div className="h-[400px] overflow-y-auto">
                                {summary.newItems.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        Nenhum novo registro encontrado.
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground sticky top-0">
                                            <tr>
                                                {columns.map(col => (
                                                    <th key={col.key} className="p-3 font-medium bg-muted">{col.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {summary.newItems.map((item, i) => (
                                                <tr key={i} className="hover:bg-muted/50">
                                                    {columns.map(col => (
                                                        <td key={col.key} className="p-3">
                                                            {String(item[col.key] || "-")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="updated" className="flex-1 border rounded-md mt-2 relative overflow-hidden">
                            <div className="h-[400px] overflow-y-auto">
                                {summary.updatedItems.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        Nenhuma atualização encontrada.
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground sticky top-0">
                                            <tr>
                                                <th className="p-3 font-medium bg-muted">Estado</th>
                                                {columns.map(col => (
                                                    <th key={col.key} className="p-3 font-medium bg-muted">{col.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {summary.updatedItems.map((item, i) => (
                                                <tr key={i} className="hover:bg-muted/50">
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-amber-500 border-amber-500">Modificado</Badge>
                                                    </td>
                                                    {columns.map(col => (
                                                        <td key={col.key} className="p-3">
                                                            {String(item[col.key] || "-")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={onConfirm} disabled={summary.newItems.length === 0 && summary.updatedItems.length === 0}>
                        Confirmar Importação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
