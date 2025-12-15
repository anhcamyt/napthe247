
import { Transaction, TransactionType, TransactionFlow, TransactionStatus, User, UserRole, CardProduct, CardProvider, SupportTicket, TicketStatus, TicketPriority, KbArticle, ChatMessage, UserGroup, ApiConnection, ApiConnectionType, UserApiKey, LoginHistory, SystemAuditLog, Notification, AutoReplyConfig, CannedResponse, PaymentGateway, PaymentFlow, PaymentMethodType, CardCode, CardCodeStatus, UserBankAccount } from "../types";
import axios from 'axios';

// Safely access env vars bypassing strict type checks if types are missing
const ENV = (import.meta as any).env || {};
const USE_MOCK = true; // Force mock for demo
const API_URL = ENV.VITE_API_URL || '/api/v1';

const DELAY = 600;

// --- MOCK DATA ---
const CURRENT_USER: User = { 
  id: 'u1', 
  name: 'Nguyen Van A', 
  email: 'demo@napthe247.com', 
  role: UserRole.USER, 
  balance: 1542000, 
  groupId: 'g2',
  groupName: 'Gold Member', 
  isPro: true, 
  security: { twoFactorEnabled: false, hasTransactionPin: true } 
};

const USERS_MOCK: User[] = [
    CURRENT_USER,
    { id: 'u2', name: 'Tran Thi B', email: 'userb@example.com', role: UserRole.USER, balance: 50000, groupId: 'g1', groupName: 'Member' },
    { id: 'u3', name: 'Admin User', email: 'admin@napthe247.com', role: UserRole.ADMIN, balance: 0, groupId: 'g4', groupName: 'Admin' }
];

const PROVIDERS_MOCK: CardProvider[] = [
    { id: 'p1', name: 'Viettel', code: 'VIETTEL', color: 'bg-green-600', type: 'TELCO' },
    { id: 'p2', name: 'Vinaphone', code: 'VINAPHONE', color: 'bg-blue-500', type: 'TELCO' },
    { id: 'p3', name: 'Mobifone', code: 'MOBIFONE', color: 'bg-yellow-500', type: 'TELCO' },
    { id: 'p4', name: 'Vietnamobile', code: 'VNMOBI', color: 'bg-orange-500', type: 'TELCO' },
    { id: 'p5', name: 'Garena', code: 'GARENA', color: 'bg-red-500', type: 'GAME' },
    { id: 'p6', name: 'Zing', code: 'ZING', color: 'bg-teal-500', type: 'GAME' },
];

const PRODUCTS_MOCK: CardProduct[] = [];
// Generate products
PROVIDERS_MOCK.forEach(p => {
    [10000, 20000, 50000, 100000, 200000, 500000].forEach(val => {
        PRODUCTS_MOCK.push({
            id: `${p.code}_${val}`,
            providerCode: p.code,
            value: val,
            buyDiscount: 3.5,
            exchangeRate: 85.0,
            feesMode: 'AUTO',
            margin: 2.0,
            upstreamRate: 87.0,
            upstreamDiscount: 5.5,
            status: 'ACTIVE'
        });
    });
});

const TRANSACTIONS_MOCK: Transaction[] = [
    { id: 'TXN-001', userId: 'u1', type: TransactionType.CARD_EXCHANGE, flow: TransactionFlow.IN, amount: 42500, currency: 'VND', status: TransactionStatus.SUCCESS, shortDescription: 'Đổi thẻ Viettel 50.000đ', createdAt: '2023-10-25 10:30', metadata: { provider: 'VIETTEL', declaredValue: 50000, realValue: 50000, serial: '1000111000' } },
    { id: 'TXN-002', userId: 'u1', type: TransactionType.CARD_PURCHASE, flow: TransactionFlow.OUT, amount: 96500, currency: 'VND', status: TransactionStatus.SUCCESS, shortDescription: 'Mua thẻ Garena 100.000đ', createdAt: '2023-10-25 11:15', metadata: { provider: 'GARENA', value: 100000, quantity: 1 } },
    { id: 'TXN-003', userId: 'u1', type: TransactionType.WALLET_TOPUP, flow: TransactionFlow.IN, amount: 500000, currency: 'VND', status: TransactionStatus.SUCCESS, shortDescription: 'Nạp tiền qua Techcombank', createdAt: '2023-10-26 09:00', metadata: { bankName: 'Techcombank' } },
];

const CONNECTIONS_MOCK: ApiConnection[] = [
    { id: 'c1', name: 'TichHop247', code: 'TH247', type: ApiConnectionType.EXCHANGE, baseUrl: 'https://api.tichhop247.com', status: 'ACTIVE', priority: 1, balance: 5000000 },
    { id: 'c2', name: 'BanThe247', code: 'BT247', type: ApiConnectionType.STORE, baseUrl: 'https://banthe247.com/api', status: 'ACTIVE', priority: 1, balance: 2500000 },
];

const GATEWAYS_MOCK: PaymentGateway[] = [
    { id: 'pg1', name: 'VietQR - MBBank', code: 'VIETQR', flow: PaymentFlow.INBOUND, methodType: PaymentMethodType.BANK_TRANSFER, status: 'ACTIVE', minAmount: 10000, maxAmount: 50000000, feePercent: 0, feeFixed: 0, config: {}, configFields: [], autoApprove: true },
    { id: 'pg2', name: 'Ví Momo', code: 'MOMO', flow: PaymentFlow.INBOUND, methodType: PaymentMethodType.E_WALLET, status: 'ACTIVE', minAmount: 20000, maxAmount: 10000000, feePercent: 0, feeFixed: 0, config: {}, configFields: [], autoApprove: true },
    { id: 'pg3', name: 'Rút về Ngân hàng', code: 'WITHDRAW_BANK', flow: PaymentFlow.OUTBOUND, methodType: PaymentMethodType.BANK_TRANSFER, status: 'ACTIVE', minAmount: 50000, maxAmount: 100000000, feePercent: 0, feeFixed: 3000, config: {}, configFields: [], autoApprove: false },
];

const API_KEYS_MOCK: UserApiKey[] = [
    { id: 'k1', userId: 'u1', userName: 'Nguyen Van A', name: 'Shop FreeFire 1', apiKey: 'sk_live_99887766', status: 'ACTIVE', createdAt: '2023-09-15', modules: ['EXCHANGE'] }
];

const USER_GROUPS_MOCK: UserGroup[] = [
    { id: 'g1', name: 'Thành viên', color: 'bg-gray-100 text-gray-800', discountExchange: 0, discountShop: 0 },
    { id: 'g2', name: 'Đại lý Bạc', color: 'bg-blue-100 text-blue-800', discountExchange: 0.5, discountShop: 1.0 },
    { id: 'g3', name: 'Đại lý Vàng', color: 'bg-yellow-100 text-yellow-800', discountExchange: 1.0, discountShop: 2.0 },
    { id: 'g4', name: 'VIP', color: 'bg-purple-100 text-purple-800', discountExchange: 1.5, discountShop: 3.0 },
];

const INVENTORY_MOCK: CardCode[] = [
    { id: 'cc1', productId: 'VIETTEL_10000', providerCode: 'VIETTEL', value: 10000, code: '123456789', serial: '100001', status: CardCodeStatus.AVAILABLE, expiryDate: '2025-12-31', createdAt: '2023-10-01' }
];

const TICKETS_MOCK: SupportTicket[] = [
    { id: 'TK-1001', userId: 'u1', subject: 'Nạp thẻ bị lỗi', description: 'Thẻ Viettel 50k báo sai mệnh giá', category: 'Card Error', status: TicketStatus.OPEN, priority: TicketPriority.HIGH, createdAt: '2023-10-27 10:00', updatedAt: '2023-10-27 10:30', messages: [{ id: 'm1', sender: 'USER', content: 'Thẻ 50k báo sai', timestamp: '10:00' }] }
];

// --- API IMPLEMENTATION ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    getUser: async () => { await delay(DELAY); return CURRENT_USER; },
    getAllUsers: async () => { await delay(DELAY); return USERS_MOCK; },
    updateUser: async (id: string, data: Partial<User>) => { await delay(DELAY); return { ...CURRENT_USER, ...data }; }, // Mock update
    
    getTransactions: async () => { await delay(DELAY); return TRANSACTIONS_MOCK; },
    getTransactionDetail: async (id: string) => { await delay(DELAY); return TRANSACTIONS_MOCK.find(t => t.id === id) || TRANSACTIONS_MOCK[0]; },
    guestLookupTransaction: async (id: string) => { await delay(DELAY); return TRANSACTIONS_MOCK.find(t => t.id === id) || null; },

    getProviders: async () => { await delay(DELAY); return PROVIDERS_MOCK; },
    getProducts: async () => { await delay(DELAY); return PRODUCTS_MOCK; },
    updateProducts: async (updates: any[]) => { await delay(DELAY); return true; },
    
    getPaymentGateways: async () => { await delay(DELAY); return GATEWAYS_MOCK; },
    updatePaymentGateway: async (id: string, data: any) => { await delay(DELAY); return true; },
    
    getUserBankAccounts: async () => { await delay(DELAY); return [{id: 'b1', userId: 'u1', bankName: 'MBBank', bankShortName: 'MB', accountNumber: '99998888', accountName: 'NGUYEN VAN A'}]; },
    addUserBankAccount: async (data: any) => { await delay(DELAY); return true; },
    deleteUserBankAccount: async (id: string) => { await delay(DELAY); return true; },
    
    createDepositRequest: async (gatewayId: string, amount: number) => { await delay(DELAY); return { qrUrl: 'https://via.placeholder.com/300', content: 'NAP 123456' }; },
    requestWithdraw: async (amount: number, bankInfo: string) => { await delay(DELAY); return true; },
    
    exchangeCard: async (provider: string, code: string, serial: string, value: number) => { 
        await delay(DELAY); 
        const newTx: Transaction = { 
            id: `TXN-${Math.floor(Math.random()*10000)}`, 
            userId: CURRENT_USER.id, 
            type: TransactionType.CARD_EXCHANGE, 
            flow: TransactionFlow.IN, 
            amount: value * 0.85, 
            currency: 'VND', 
            status: TransactionStatus.PENDING, 
            shortDescription: `Đổi thẻ ${provider} ${value.toLocaleString()}đ`, 
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            metadata: { provider, declaredValue: value, serial, code: code.substring(0, 5)+'***' }
        };
        TRANSACTIONS_MOCK.unshift(newTx);
        return newTx;
    },
    
    buyCard: async (provider: string, value: number, quantity: number) => {
        await delay(DELAY);
        const cards = Array(quantity).fill(0).map((_, i) => ({ code: '111222333444', serial: '999888777', value, expiry: '31/12/2025' }));
        return { cards, transactionId: 'TXN-BUY-123' };
    },
    
    getUserApiKeys: async () => { await delay(DELAY); return API_KEYS_MOCK; },
    registerUserApiKey: async (data: any) => { await delay(DELAY); return true; },
    deleteUserApiKey: async (id: string) => { await delay(DELAY); return true; },
    getAdminUserApiKeys: async () => { await delay(DELAY); return API_KEYS_MOCK; },
    updateUserApiKeyStatus: async (id: string, status: string) => { await delay(DELAY); return true; },
    
    getLoginHistory: async () => { await delay(DELAY); return [{id: 'l1', userId: 'u1', device: 'Chrome Windows', ip: '1.2.3.4', location: 'Hanoi, VN', timestamp: '2023-10-27 08:00', status: 'SUCCESS'}]; },
    
    toggle2FA: async (enable: boolean) => { await delay(DELAY); return true; },
    generateTwoFactorSecret: async () => { await delay(DELAY); return { secret: 'JBSWY3DPEHPK3PXP', otpauthUrl: 'otpauth://totp/NapThe247?secret=JBSWY3DPEHPK3PXP' }; },
    verifyTwoFactorToken: async (token: string) => { await delay(DELAY); return token === '123456'; },
    updateTransactionPin: async (pin: string) => { await delay(DELAY); return true; },
    
    getUserGroups: async () => { await delay(DELAY); return USER_GROUPS_MOCK; },
    saveUserGroup: async (group: any) => { await delay(DELAY); return true; },
    deleteUserGroup: async (id: string) => { await delay(DELAY); return true; },
    
    getApiConnections: async () => { await delay(DELAY); return CONNECTIONS_MOCK; },
    saveApiConnection: async (conn: any) => { await delay(DELAY); return true; },
    deleteApiConnection: async (id: string) => { await delay(DELAY); return true; },
    
    getCardInventory: async () => { await delay(DELAY); return INVENTORY_MOCK; },
    importCardCodes: async (provider: string, value: number, codes: any[]) => { await delay(DELAY); return true; },
    deleteCardCode: async (id: string) => { await delay(DELAY); return true; },
    
    getKbArticles: async () => { await delay(DELAY); return [{id: 'kb1', title: 'Hướng dẫn đổi thẻ cào', category: 'General', content: '...', views: 100}]; },
    getTickets: async () => { await delay(DELAY); return TICKETS_MOCK; },
    createTicket: async (data: any) => { await delay(DELAY); return true; },
    getTicketDetails: async (id: string) => { await delay(DELAY); return TICKETS_MOCK[0]; },
    sendTicketMessage: async (id: string, content: string, sender: string) => { await delay(DELAY); return { id: `m${Date.now()}`, sender: 'USER', content, timestamp: 'Now' }; }
};
