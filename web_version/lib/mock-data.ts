
export interface ClientData {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
}

export const MOCK_CLIENTS: ClientData[] = [
    { id: 1, name: "Maria Silva", email: "maria@email.com", phone: "(11) 99999-1111", address: "Rua A, 123", city: "São Paulo" },
    { id: 2, name: "João Santos", email: "joao@email.com", phone: "(11) 99999-2222", address: "Av. B, 456", city: "Campinas" },
    { id: 3, name: "Pedro Henrique", email: "pedro@email.com", phone: "(11) 99999-3333", address: "Rua C, 789", city: "Santos" },
];

export interface Transaction {
    id: number;
    description: string;
    type: "income" | "expense";
    amount: number;
    method: string;
    date: string;
    time: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 1, description: "Venda Balcão #101", type: "income", amount: 150.00, method: "Dinheiro", date: new Date().toISOString().slice(0, 10), time: "10:30" },
    { id: 2, description: "Pagamento Fornecedor", type: "expense", amount: 500.00, method: "PIX", date: new Date().toISOString().slice(0, 10), time: "09:15" },
    { id: 3, description: "Venda Balcão #102", type: "income", amount: 75.50, method: "Cartão de Crédito", date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), time: "14:20" },
    { id: 4, description: "Conta de Luz", type: "expense", amount: 250.00, method: "Boleto", date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), time: "11:00" },
    { id: 5, description: "Venda Balcão #103", type: "income", amount: 320.00, method: "PIX", date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10), time: "16:45" },
];

export interface ReceivableData {
    id: number;
    description: string;
    customer: string;
    value: number;
    due_date: string;
    status: "Pendente" | "Recebido" | "Atrasado";
    original_value?: number;
    discount?: number;
    addition?: number;
    payment_date?: string;
    payment_method?: string;
}

export const MOCK_RECEIVABLES: ReceivableData[] = [
    { id: 1, description: "Venda #103", customer: "João Silva", value: 250.00, due_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), status: "Pendente" },
    { id: 2, description: "Venda #99", customer: "Maria Souza", value: 120.00, due_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), status: "Atrasado" },
    { id: 3, description: "Venda #50", customer: "Pedro Henrique", value: 300.00, due_date: "2023-12-01", status: "Recebido", payment_date: "2023-12-01", payment_method: "PIX" },
];

export interface CashRegister {
    id: number;
    date: string;
    status: "open" | "closed";
    opening_amount: number;
    closing_amount: number | null;
    expected_amount: number | null;
    difference: number | null;
    operator: string | null;
    opened_at: string;
    closed_at: string | null;
    notes: string | null;
}

export const MOCK_REGISTER: CashRegister = {
    id: 1,
    date: new Date().toISOString().slice(0, 10),
    status: "open",
    opening_amount: 150.00,
    closing_amount: null,
    expected_amount: null,
    difference: null,
    operator: "Demo User",
    opened_at: new Date().toISOString(),
    closed_at: null,
    notes: "Demo Register"
};

export interface CashMovement {
    id: number;
    register_id: number;
    type: "opening" | "sale" | "sangria" | "suprimento" | "closing";
    amount: number;
    description: string | null;
    payment_method: string | null;
    created_at: string;
}

export const MOCK_MOVEMENTS: CashMovement[] = [
    { id: 1, register_id: 1, type: "opening", amount: 150.00, description: "Abertura de Caixa", payment_method: "Dinheiro", created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 2, register_id: 1, type: "sale", amount: 55.00, description: "Venda #105", payment_method: "Dinheiro", created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: 3, register_id: 1, type: "sale", amount: 20.00, description: "Venda #106", payment_method: "Dinheiro", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 4, register_id: 1, type: "sangria", amount: 100.00, description: "Pagamento Motoboy", payment_method: "Dinheiro", created_at: new Date(Date.now() - 3600000 * 1).toISOString() },
];

export interface Sale {
    id: number;
    customer_name: string;
    customer_phone: string | null;
    payment_method: string;
    payment_condition: string;
    subtotal: number;
    discount: number;
    total: number;
    items: { name: string; quantity: number; price: number }[];
    created_at: string;
    status?: string;
}

export const MOCK_SALES: Sale[] = [
    {
        id: 105,
        customer_name: "João Silva",
        customer_phone: "(11) 99999-1111",
        payment_method: "dinheiro",
        payment_condition: "a_vista",
        subtotal: 55.00,
        discount: 0,
        total: 55.00,
        items: [{ name: "Tinta Acrílica", quantity: 1, price: 55.00 }],
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: "completed"
    },
    {
        id: 106,
        customer_name: "Maria Souza",
        customer_phone: "(11) 99999-2222",
        payment_method: "pix",
        payment_condition: "a_vista",
        subtotal: 22.00,
        discount: 2.00,
        total: 20.00,
        items: [{ name: "Pincel", quantity: 2, price: 11.00 }],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "completed"
    },
    {
        id: 104,
        customer_name: "Consumidor Final",
        customer_phone: null,
        payment_method: "cartão crédito",
        payment_condition: "a_vista",
        subtotal: 150.00,
        discount: 0,
        total: 150.00,
        items: [{ name: "Massa Corrida 18L", quantity: 2, price: 75.00 }],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: "completed"
    }
];

export const STORE_SETTINGS = {
    storeName: "Casa das Cores",
    legalName: "Casa das Cores LTDA",
    cnpj: "00.000.000/0001-00",
    ie: "000.000.000.000",
    address: "Rua Exemplo, 123 - Centro"
};
