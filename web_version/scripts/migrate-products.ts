import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load .env.local manually to ensure it works
console.log('Current working directory:', process.cwd());
const envPath = path.resolve(process.cwd(), '.env.local');

try {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log(`Loaded ${Object.keys(envConfig).length} environment variables from .env.local`);
} catch (e) {
    console.error('Error loading .env.local:', e);
}

import { PRODUCTS_DATA } from '../lib/products-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
    console.log(`Starting migration of ${PRODUCTS_DATA.length} products...`);

    // Chunk the data to avoid payload too large
    const chunkSize = 100;
    for (let i = 0; i < PRODUCTS_DATA.length; i += chunkSize) {
        const chunk = PRODUCTS_DATA.slice(i, i + chunkSize);

        // Map data if necessary to match DB columns exactly
        const records = chunk.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            status: p.status
        }));

        const { error } = await supabase.from('products').upsert(records);

        if (error) {
            console.error('Error inserting chunk:', error);
        } else {
            console.log(`Inserted ${i + chunk.length} / ${PRODUCTS_DATA.length}`);
        }
    }

    console.log('Migration complete!');
}

migrate();
