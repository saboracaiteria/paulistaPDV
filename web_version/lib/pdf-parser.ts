import * as pdfjsLib from 'pdfjs-dist';
import { Product } from './products-data';

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
}

export interface Supplier {
    id: number;
    name: string;
    contact: string;
    phone: string;
    email: string;
    category: string;
}

export interface Receivable {
    id: number;
    description: string;
    customer: string;
    value: number;
    dueDate: string;
    status: "Pendente" | "Recebido" | "Atrasado";
    // Settlement fields
    originalValue?: number;
    discount?: number;
    addition?: number;
    paymentDate?: string;
    paymentMethod?: string;
}

// Configure worker - using local file for offline support
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function parseProductPdf(file: File): Promise<Product[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const products: Product[] = [];

    // Start ID from a high number to avoid conflicts, or handle in the component
    // We'll let the component handle ID reassignment if needed, but here we provide valid ones.
    let currentId = 1000;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Simple strategy: Join all items with space, then split by newlines if items have Y co-ords differences?
        // PDF.js text items are distinct strings. 
        // We'll gather lines based on Y position (tolerance of few pixels).

        const items: any[] = textContent.items;
        const lines: { y: number, text: string }[] = [];

        for (const item of items) {
            // item.transform[5] is the y-coordinate usually
            const y = item.transform ? Math.round(item.transform[5]) : 0;
            const text = item.str.trim();

            if (!text) continue;

            const existingLine = lines.find(l => Math.abs(l.y - y) < 5);
            if (existingLine) {
                existingLine.text += " " + text;
            } else {
                lines.push({ y, text });
            }
        }

        // Sort lines by Y descending (top to bottom)
        lines.sort((a, b) => b.y - a.y);

        // Process lines
        for (const line of lines) {
            const text = line.text;

            // Heuristic: Look for lines that have a price (R$ ...) and maybe a stock number
            // Example pattern we hope for: "Product Name R$ 10,00 50"
            // Or just: "Product Name 10,00"

            // Regex to find price like R$ 10,00 or 10,00
            const priceMatch = text.match(/(?:R\$?\s*)?(\d+[.,]\d{2})/);

            if (priceMatch && text.length > 5) {
                // Assuming the text before price is name
                const priceStr = priceMatch[0];
                const priceVal = parseFloat(priceMatch[1].replace(',', '.'));

                const parts = text.split(priceStr);
                const name = parts[0].trim();

                // Try to find stock after price
                let stock = 0;
                if (parts[1]) {
                    const stockMatch = parts[1].match(/(\d+)/);
                    if (stockMatch) {
                        stock = parseInt(stockMatch[1], 10);
                    }
                }

                if (name.length > 2) {
                    products.push({
                        id: currentId++,
                        name: name,
                        category: "Importado",
                        price: priceVal,
                        stock: stock,
                        status: stock > 0 ? "Ativo" : "Esgotado"
                    });
                }
            }
        }
    }

    return products;
}

export async function parseCustomerPdf(file: File): Promise<Customer[]> {
    return parseGenericPdf<Customer>(file, (text, id) => {
        // Heuristic: Name Email Phone Address
        // Example: "João Silva joao@email.com (11)99999-9999 Rua X"

        const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
        if (emailMatch) {
            const email = emailMatch[0];
            const parts = text.split(email);
            const name = parts[0].trim();

            let phone = "";
            let address = "";
            let city = "Desconhecida";

            if (parts[1]) {
                const phoneMatch = parts[1].match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/);
                if (phoneMatch) {
                    phone = phoneMatch[0];
                    const rest = parts[1].split(phone);
                    address = rest[1]?.trim() || "";
                    // Try to guess city based on last word or common cities? Keeping simple for now.
                }
            }

            if (name.length > 2) {
                return {
                    id,
                    name,
                    email,
                    phone,
                    address,
                    city
                };
            }
        }
        return null;
    });
}

export async function parseSupplierPdf(file: File): Promise<Supplier[]> {
    return parseGenericPdf<Supplier>(file, (text, id) => {
        // Heuristic: Name Contact Phone Email
        const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
        if (emailMatch) {
            const email = emailMatch[0];
            const parts = text.split(email);
            const name = parts[0].trim();
            const phoneMatch = text.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/);
            const phone = phoneMatch ? phoneMatch[0] : "";

            if (name.length > 2) {
                return {
                    id,
                    name,
                    contact: "Gerente", // Placeholder
                    phone,
                    email,
                    category: "Geral"
                };
            }
        }
        return null;
    });
}

export async function parseReceivablePdf(file: File): Promise<Receivable[]> {
    return parseGenericPdf<Receivable>(file, (text, id) => {
        // Heuristic: Description Customer Value Date
        // Example: "Venda #123 João Silva R$ 100,00 20/12/2025"

        const priceMatch = text.match(/(?:R\$?\s*)?(\d+[.,]\d{2})/);
        const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);

        if (priceMatch && dateMatch) {
            const value = parseFloat(priceMatch[1].replace(',', '.'));
            const dueDate = dateMatch[0];
            const parts = text.split(priceMatch[0]);

            // Assume description is first 2 words, rest is customer? Very shaky heuristic.
            // Let's assume Description is first, Customer is second.
            const descPart = parts[0].trim();

            return {
                id,
                description: descPart, // "Venda #123 João Silva"
                customer: "Cliente Importado",
                value,
                dueDate,
                status: "Pendente"
            };
        }
        return null;
    });
}

// Generic helper to avoid code duplication
async function parseGenericPdf<T>(file: File, parser: (text: string, id: number) => T | null): Promise<T[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const items: T[] = [];
    let currentId = 2000; // Start IDs high

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const rawItems: any[] = textContent.items;
        const lines: { y: number, text: string }[] = [];

        for (const item of rawItems) {
            const y = item.transform ? Math.round(item.transform[5]) : 0;
            const text = item.str.trim();
            if (!text) continue;

            const existingLine = lines.find(l => Math.abs(l.y - y) < 5);
            if (existingLine) {
                existingLine.text += " " + text;
            } else {
                lines.push({ y, text });
            }
        }
        lines.sort((a, b) => b.y - a.y);

        for (const line of lines) {
            const result = parser(line.text, currentId++);
            if (result) items.push(result);
        }
    }
    return items;
}
