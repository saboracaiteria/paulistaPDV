import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
    parseProductPdf,
    parseCustomerPdf,
    parseSupplierPdf,
    parseReceivablePdf,
    Customer,
    Supplier,
    Receivable
} from './pdf-parser';
import { Product } from './products-data';

// Re-export types for convenience
export type { Product, Customer, Supplier, Receivable };

export type ImportType = 'products' | 'customers' | 'suppliers' | 'receivables';

export async function parseImportFile(file: File, type: ImportType): Promise<any[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
        switch (type) {
            case 'products': return parseProductPdf(file);
            case 'customers': return parseCustomerPdf(file);
            case 'suppliers': return parseSupplierPdf(file);
            case 'receivables': return parseReceivablePdf(file);
        }
    } else if (extension === 'json') {
        return parseJson(file);
    } else if (extension === 'csv') {
        return parseCsv(file, type);
    } else if (['xls', 'xlsx'].includes(extension || '')) {
        return parseExcel(file, type);
    }

    throw new Error(`Formato .${extension} não suportado.`);
}

function parseJson(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) resolve(parsed);
                else reject(new Error("Arquivo JSON não contém uma lista array"));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function parseCsv(file: File, type: ImportType): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data;
                resolve(mapRawDataToEntity(data, type));
            },
            error: (error) => reject(error)
        });
    });
}

function parseExcel(file: File, type: ImportType): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(mapRawDataToEntity(jsonData, type));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Helper: Normalize keys (toLowerCase) and map to entity interfaces
function mapRawDataToEntity(data: any[], type: ImportType): any[] {
    return data.map((item: any, index: number) => {
        // Normalize keys: trim and lowercase
        const normalized: any = {};
        Object.keys(item).forEach(key => {
            normalized[key.trim().toLowerCase()] = item[key];
        });

        const id = Math.random(); // Temp ID, will be overwritten by logic

        switch (type) {
            case 'products':
                return {
                    id,
                    name: normalized['nome'] || normalized['name'] || "Sem Nome",
                    category: normalized['categoria'] || normalized['category'] || "Geral",
                    price: parseFloat(normalized['preço'] || normalized['preco'] || normalized['price'] || "0"),
                    stock: parseInt(normalized['estoque'] || normalized['stock'] || "0"),
                    status: (parseInt(normalized['estoque'] || "0") > 0) ? "Ativo" : "Esgotado"
                } as Product;
            case 'customers':
                return {
                    id,
                    name: normalized['nome'] || normalized['name'] || "Sem Nome",
                    email: normalized['email'] || "",
                    phone: normalized['telefone'] || normalized['phone'] || "",
                    address: normalized['endereço'] || normalized['endereco'] || normalized['address'] || "",
                    city: normalized['cidade'] || normalized['city'] || ""
                } as Customer;
            case 'suppliers':
                return {
                    id,
                    name: normalized['nome'] || normalized['name'] || "Sem Nome",
                    contact: normalized['contato'] || normalized['contact'] || "",
                    phone: normalized['telefone'] || normalized['phone'] || "",
                    email: normalized['email'] || "",
                    category: normalized['categoria'] || normalized['category'] || "Geral"
                } as Supplier;
            case 'receivables':
                return {
                    id,
                    description: normalized['descrição'] || normalized['descricao'] || normalized['description'] || "Importado",
                    customer: normalized['cliente'] || normalized['customer'] || "",
                    value: parseFloat(normalized['valor'] || normalized['value'] || "0"),
                    dueDate: normalized['vencimento'] || normalized['data'] || normalized['date'] || "",
                    status: (normalized['status'] || "Pendente")
                } as Receivable;
        }
    });
}
