
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const csvPath = path.resolve(process.cwd(), 'produtos.csv');
const outputPath = path.resolve(process.cwd(), 'lib/products-data.ts');

console.log(`Reading CSV from ${csvPath}...`);
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
Papa.parse(fileContent, {
    delimiter: ',',
    quoteChar: '"',
    complete: (results) => {
        const products: any[] = [];
        const rows = results.data as string[][];

        console.log(`Found ${rows.length} rows.`);

        let count = 0;
        for (const row of rows) {
            // Basic validation: need at least 2 columns or specific structure
            if (!row || row.length < 2) continue;

            const col0 = row[0]; // Description
            // const col2 = row[2]; // NCM
            // const col3 = row[3]; // Manufacturer info + stock
            // const col4 = row[4]; // Price

            // Dynamic logic: Price is last, Stock info is second to last
            const lastIdx = row.length - 1;
            const priceCol = row[lastIdx];
            const stockCol = row[lastIdx - 1];

            if (!col0 || !stockCol || !priceCol) {
                console.log(`Skipping row ${count} (missing cols):`, row);
                continue;
            }

            // Extract ID and Name
            // Example: "56004 - 11159-C33 - TORNEIRA COZINHA"
            const idMatch = col0.match(/^(\d+)\s*-\s*(.*)$/);
            if (!idMatch) {
                console.log(`Skipping row ${count} (id mismatch):`, col0);
                continue;
            }

            const id = parseInt(idMatch[1], 10);
            const name = idMatch[2].trim();

            // Extract Price
            // Example: "80,89" -> 80.89
            const priceStr = priceCol.replace(/\./g, '').replace(',', '.').trim();
            const price = parseFloat(priceStr);

            if (isNaN(price)) {
                console.log(`Skipping row ${count} (NaN price):`, priceCol);
                continue;
            }

            // Extract Stock
            // Example: "9937586 MARCHEZAN 1 UN 3,00"
            // We look for the last number sequence in the string
            // Matches "-3,00" or "3,00"
            const stockMatch = stockCol.match(/(-?\d+(?:,\d+)?)\s*$/);

            let stock = 0;
            if (stockMatch) {
                const stockStr = stockMatch[1].replace(/\./g, '').replace(',', '.');
                stock = parseFloat(stockStr);
            }

            const status = stock > 0 ? "Ativo" : "Esgotado";

            products.push({
                id,
                name,
                category: "Geral", // Default category
                price,
                stock,
                status
            });
            count++;
        }

        console.log(`Parsed ${count} valid products.`);
        console.log(`Total rows processed: ${rows.length}`);

        const fileContent = `export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: "Ativo" | "Baixo Estoque" | "Esgotado";
}

export const PRODUCTS_DATA: Product[] = ${JSON.stringify(products, null, 4)};
`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log(`Wrote data to ${outputPath}`);
    },
    error: (err: any) => {
        console.error("Papa Parse Error:", err);
    }
});
