import { Transaction, TransactionType, TransactionFlow, TransactionStatus, User, UserRole, CardProduct, CardProvider, SupportTicket, TicketStatus, TicketPriority, KbArticle, ChatMessage, UserGroup, ApiConnection, ApiConnectionType, UserApiKey, LoginHistory, SystemAuditLog, Notification, AutoReplyConfig, CannedResponse, PaymentGateway, PaymentFlow, PaymentMethodType, CardCode, CardCodeStatus, UserBankAccount } from "../types";

const DELAY = 600;

// --- UTILS ---
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleString('vi-VN');
};

const randomId = (prefix: string) => `${prefix}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

// --- MOCK API CONNECTIONS ---
let API_CONNECTIONS: ApiConnection[] = [
    {
        id: 'conn_1',
        name: 'TichHop247 (Gạch thẻ)',
        code: 'TICHHOP247',
        type: ApiConnectionType.EXCHANGE,
        baseUrl: 'https://api.tichhop247.com/v2',
        username: 'partner_123',
        apiKey: 'th247_prod_998877',
        secretKey: '****************',
        status: 'ACTIVE',
        priority: 1,
        balance: 5000000,
        webhookUrl: 'https://napthe247.com/api/callback/th247'
    },
    {
        id: 'conn_2',
        name: 'GateCard (Kho thẻ)',
        code: 'GATECARD',
        type: ApiConnectionType.STORE,
        baseUrl: 'https://gate.io/api',
        username: 'shop_vip',
        apiKey: 'gate_live_xyz',
        status: 'ACTIVE',
        priority: 1,
        balance: 12000000
    },
    {
        id: 'conn_3',
        name: 'Banthe247 (Dự phòng)',
        code: 'BANTHE247',
        type: ApiConnectionType.EXCHANGE,
        baseUrl: 'https://banthe247.com/api',
        status: 'ACTIVE',
        priority: 2,
        balance: 1000000
    }
];

// --- MOCK PAYMENT GATEWAYS ---
let PAYMENT_GATEWAYS: PaymentGateway[] = [
  // --- INBOUND (Nạp tiền) ---
  {
    id: 'pg_1',
    code: 'CASSO_VIETQR',
    name: 'VietQR - Casso (Tự động)',
    flow: PaymentFlow.INBOUND,
    methodType: PaymentMethodType.BANK_TRANSFER,
    status: 'ACTIVE',
    minAmount: 10000,
    maxAmount: 500000000,
    feePercent: 0,
    feeFixed: 0,
    autoApprove: true,
    config: { apiKey: '***', bankAccount: '001100223344', bankName: 'VCB' },
    configFields: [{ key: 'apiKey', label: 'Casso API Key', type: 'password', required: true }],
    description: 'Nạp tiền tự động 24/7 qua Vietcombank. Nội dung chuyển khoản là mã giao dịch.'
  },
  {
    id: 'pg_2',
    code: 'MOMO_AUTO',
    name: 'Momo Tự Động',
    flow: PaymentFlow.INBOUND,
    methodType: PaymentMethodType.E_WALLET,
    status: 'ACTIVE',
    minAmount: 20000,
    maxAmount: 20000000,
    feePercent: 0,
    feeFixed: 0,
    autoApprove: true,
    config: { phone: '0988777666' },
    configFields: [{ key: 'phone', label: 'Số điện thoại Momo', type: 'text', required: true }],
    description: 'Quét mã QR Momo để nạp tiền. Xử lý trong 30 giây.'
  },
  {
    id: 'pg_3',
    code: 'USDT_TRC20',
    name: 'USDT (TRC20)',
    flow: PaymentFlow.INBOUND,
    methodType: PaymentMethodType.CRYPTO,
    status: 'MAINTENANCE',
    minAmount: 10,
    maxAmount: 10000,
    feePercent: 0,
    feeFixed: 0,
    autoApprove: true,
    config: { wallet: 'T9yD1...' },
    configFields: [{ key: 'wallet', label: 'Wallet Address', type: 'text' }],
    description: 'Nạp qua mạng Tron (TRC20). Tỷ giá theo sàn Binance P2P.'
  },

  // --- OUTBOUND (Rút tiền) ---
  {
    id: 'pg_4',
    code: 'BANK_PAYOUT',
    name: 'Rút về Ngân hàng',
    flow: PaymentFlow.OUTBOUND,
    methodType: PaymentMethodType.BANK_TRANSFER,
    status: 'ACTIVE',
    minAmount: 50000,
    maxAmount: 300000000,
    feePercent: 0,
    feeFixed: 0,
    autoApprove: false,
    config: {},
    configFields: [],
    description: 'Hỗ trợ tất cả ngân hàng tại Việt Nam (NapAS).'
  },
  {
    id: 'pg_5',
    code: 'MOMO_PAYOUT',
    name: 'Rút về ví Momo',
    flow: PaymentFlow.OUTBOUND,
    methodType: PaymentMethodType.E_WALLET,
    status: 'ACTIVE',
    minAmount: 20000,
    maxAmount: 10000000,
    feePercent: 1.0,
    feeFixed: 0,
    autoApprove: true,
    config: {},
    configFields: [],
    description: 'Rút tiền về ví Momo chính chủ.'
  }
];

// --- MOCK DATA GENERATION ---

// Users
const USERS_MOCK: User[] = [
  { id: 'u1', name: 'Nguyen Van A', email: 'nguyenvana@example.com', role: UserRole.USER, balance: 1542000, groupId: 'g2', isPro: true, security: { twoFactorEnabled: false, hasTransactionPin: true } },
  { id: 'u2', name: 'Tran Thi B', email: 'tranthib@example.com', role: UserRole.USER, balance: 50000, groupId: 'g1' },
  { id: 'u3', name: 'Le Van C', email: 'levanc@example.com', role: UserRole.ADMIN, balance: 0, groupId: 'g4' },
  { id: 'u4', name: 'Pham Van D', email: 'phamvand@gmail.com', role: UserRole.USER, balance: 12500000, groupId: 'g3' },
  { id: 'u5', name: 'Shop Acc FF', email: 'shopffvip@gmail.com', role: UserRole.USER, balance: 450000, groupId: 'g2' },
  { id: 'u6', name: 'Daily The Cao', email: 'dailythe@yahoo.com', role: UserRole.USER, balance: 89000000, groupId: 'g4' },
];

let CURRENT_USER = USERS_MOCK[0];

// User Bank Accounts Mock
let USER_BANK_ACCOUNTS: UserBankAccount[] = [
    { id: 'b1', userId: 'u1', bankName: 'MBBank', bankShortName: 'MB', accountNumber: '0988777666', accountName: 'NGUYEN VAN A' },
    { id: 'b2', userId: 'u1', bankName: 'Vietcombank', bankShortName: 'VCB', accountNumber: '001122334455', accountName: 'NGUYEN VAN A' }
];

// User Groups
const USER_GROUPS: UserGroup[] = [
  { id: 'g1', name: 'Thành viên (Lvl 1)', description: 'Mặc định', color: 'bg-gray-100 text-gray-700', discountExchange: 0, discountShop: 0, minSpend: 0 },
  { id: 'g2', name: 'Bạc (Lvl 2)', description: 'Khách hàng thân thiết', color: 'bg-blue-100 text-blue-700', discountExchange: 0.5, discountShop: 0.5, minSpend: 5000000 },
  { id: 'g3', name: 'Vàng (Lvl 3)', description: 'Đại lý cấp thấp', color: 'bg-yellow-100 text-yellow-700', discountExchange: 1.0, discountShop: 1.0, minSpend: 20000000 },
  { id: 'g4', name: 'Kim Cương (VIP)', description: 'Đại lý cấp cao', color: 'bg-purple-100 text-purple-700', discountExchange: 2.0, discountShop: 2.0, minSpend: 100000000 },
];

// User API Keys
let USER_API_KEYS: UserApiKey[] = [
    { id: 'k1', userId: 'u1', userName: 'Nguyen Van A', name: 'Shop Web Chính', apiKey: 'nt247_live_8392019283', status: 'ACTIVE', modules: ['EXCHANGE'], createdAt: '2023-10-01 12:00', ipWhitelist: '14.1.1.1' },
    { id: 'k2', userId: 'u5', userName: 'Shop Acc FF', name: 'Tool Auto Gạch', apiKey: 'nt247_live_9988776655', status: 'PENDING', modules: ['EXCHANGE', 'SHOP'], createdAt: '2023-10-26 09:00', callbackUrl: 'https://myshop.com/callback' },
];

// --- GENERATE TRANSACTIONS (REVISED) ---
const generateTransactions = (count: number): Transaction[] => {
  const txs: Transaction[] = [];
  
  // 1. Dữ liệu cố định (Hardcoded scenarios) để test 5 trạng thái chính
  const demoData: Transaction[] = [
      {
          id: 'TXN_SUCCESS_01',
          userId: 'u1',
          type: TransactionType.CARD_EXCHANGE,
          flow: TransactionFlow.IN,
          amount: 87000,
          currency: 'VND',
          status: TransactionStatus.SUCCESS,
          source: 'WEB',
          shortDescription: 'Đổi thẻ VIETTEL 100,000đ',
          fullDescription: 'Đổi thẻ cào thành công. Mệnh giá 100,000đ. Thực nhận 87,000đ.',
          metadata: { provider: 'VIETTEL', serial: '100048291023', code: '5123992833123', declaredValue: 100000, realValue: 100000, providerName: 'TichHop247' },
          createdAt: new Date().toLocaleString('vi-VN'),
          updatedAt: new Date(Date.now() + 30000).toLocaleString('vi-VN'), // +30s
          timeline: [
              { id: 'e1', status: TransactionStatus.PENDING, note: 'Gửi thẻ lên hệ thống', createdAt: '...' },
              { id: 'e2', status: TransactionStatus.SUCCESS, note: 'Thẻ đúng. Hoàn thành.', createdAt: '...' }
          ]
      },
      // ... (Rest of generated transactions - kept short for brevity)
  ];

  txs.push(...demoData);
  return txs;
};

let TRANSACTIONS = generateTransactions(40);

// Products & Providers (Mock)
const PROVIDERS: CardProvider[] = [
  { id: 'p1', code: 'VIETTEL', name: 'Viettel', color: 'bg-red-600', type: 'TELCO' },
  { id: 'p2', code: 'VINAPHONE', name: 'Vina', color: 'bg-blue-500', type: 'TELCO' },
  { id: 'p3', code: 'MOBIFONE', name: 'Mobi', color: 'bg-blue-700', type: 'TELCO' },
  { id: 'p4', code: 'VIETNAMOBILE', name: 'Vnmobi', color: 'bg-orange-500', type: 'TELCO' },
  { id: 'p5', code: 'ZING', name: 'Zing', color: 'bg-teal-500', type: 'GAME' },
  { id: 'p6', code: 'GARENA', name: 'Garena', color: 'bg-red-500', type: 'GAME' },
  { id: 'p7', code: 'GATE', name: 'Gate', color: 'bg-orange-600', type: 'GAME' },
  { id: 'p8', code: 'VCOIN', name: 'Vcoin', color: 'bg-purple-600', type: 'GAME' },
];

const PRODUCTS: CardProduct[] = [];
const DENOMINATIONS = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000];
PROVIDERS.forEach(p => {
  DENOMINATIONS.forEach(val => {
    PRODUCTS.push({
      id: `${p.code}_${val}`,
      providerCode: p.code,
      value: val,
      buyDiscount: 5.0,
      exchangeRate: 85.0,
      feesMode: 'AUTO',
      margin: 2.0,
      upstreamRate: 87.0,
      upstreamDiscount: 7.0,
      status: 'ACTIVE',
    });
  });
});

const CARD_INVENTORY: CardCode[] = [];
// ... inventory mock

// --- MOCK SUPPORT DATA ---
let NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        targetGroup: 'ALL',
        title: 'Bảo trì hệ thống nạp thẻ Viettel',
        content: 'Hệ thống sẽ bảo trì cổng nạp thẻ Viettel từ 00:00 đến 02:00 ngày 01/11/2023. Các cổng khác hoạt động bình thường.',
        type: 'WARNING',
        sentAt: '2023-10-30 15:00',
        sentBy: 'Admin'
    }
];

let TICKETS: SupportTicket[] = [
    {
        id: 'TIC-1698771234',
        userId: 'u1',
        userName: 'Nguyen Van A',
        subject: 'Nạp tiền qua Momo chưa nhận được',
        description: 'Tôi đã chuyển khoản 500k qua Momo lúc 10h30 nhưng ví chưa cộng tiền. Mã giao dịch Momo: 2398123.',
        category: 'Finance',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdAt: '2023-11-01 10:45',
        updatedAt: '2023-11-01 11:00',
        messages: [
             {
                 id: 'msg_1',
                 sender: 'USER',
                 content: 'Tôi đã chuyển khoản 500k qua Momo lúc 10h30 nhưng ví chưa cộng tiền. Mã giao dịch Momo: 2398123.',
                 timestamp: '10:45'
             },
             {
                 id: 'msg_2',
                 sender: 'AGENT',
                 content: 'Chào bạn, kỹ thuật bên mình đang kiểm tra đối soát với bên Momo. Vui lòng chờ trong ít phút.',
                 timestamp: '11:00'
             }
        ]
    }
];

let AUTO_REPLY_CONFIG: AutoReplyConfig = {
    enabled: true,
    offlineMode: true,
    welcomeMessage: 'Xin chào! Tôi có thể giúp gì cho bạn?',
    offlineMessage: 'Hiện tại chúng tôi không online. Vui lòng để lại lời nhắn.',
    useAi: false,
    aiProvider: 'GEMINI'
};

// API Implementation
export const mockApi = {
  getUser: async () => { await new Promise(r => setTimeout(r, DELAY)); return CURRENT_USER; },
  getAllUsers: async () => { 
      await new Promise(r => setTimeout(r, DELAY)); 
      return USERS_MOCK.map(u => ({...u, groupName: USER_GROUPS.find(g => g.id === u.groupId)?.name})); 
  },
  updateUser: async (id: string, data: Partial<User>) => { 
      const idx = USERS_MOCK.findIndex(u => u.id === id);
      if(idx !== -1) {
          USERS_MOCK[idx] = { ...USERS_MOCK[idx], ...data };
      }
  },
  
  // --- Bank Accounts (NEW) ---
  getUserBankAccounts: async () => {
      await new Promise(r => setTimeout(r, DELAY));
      return USER_BANK_ACCOUNTS.filter(b => b.userId === CURRENT_USER.id);
  },
  
  addUserBankAccount: async (data: Partial<UserBankAccount>) => {
      await new Promise(r => setTimeout(r, DELAY));
      const newBank: UserBankAccount = {
          id: randomId('bank'),
          userId: CURRENT_USER.id,
          bankName: data.bankName || 'Bank',
          accountNumber: data.accountNumber || '',
          accountName: data.accountName || '',
          bankShortName: data.bankShortName,
      };
      USER_BANK_ACCOUNTS.push(newBank);
      return newBank;
  },
  
  deleteUserBankAccount: async (id: string) => {
      await new Promise(r => setTimeout(r, DELAY));
      const idx = USER_BANK_ACCOUNTS.findIndex(b => b.id === id);
      if (idx !== -1) USER_BANK_ACCOUNTS.splice(idx, 1);
  },

  getTransactions: async () => { await new Promise(r => setTimeout(r, DELAY)); return TRANSACTIONS; },
  getTransactionDetail: async (id: string) => { await new Promise(r => setTimeout(r, DELAY)); return TRANSACTIONS.find(t => t.id === id); },
  getUserTransactions: async (userId: string) => { await new Promise(r => setTimeout(r, DELAY)); return TRANSACTIONS; },
  
  // Payment
  getPaymentGateways: async () => { await new Promise(r => setTimeout(r, DELAY)); return PAYMENT_GATEWAYS; },
  
  // Wallet Actions (Simulated)
  requestWithdraw: async (amount: number, bankInfo: string) => {
      await new Promise(r => setTimeout(r, 1000));
      
      // Parse bank info if it's a JSON string from our new selector, otherwise treat as plain text
      let bankMeta: any = { bankInfo };
      try {
          const parsed = JSON.parse(bankInfo);
          if (parsed.bankName && parsed.accountNumber) {
              bankMeta = { 
                  bankName: parsed.bankName, 
                  bankAccount: parsed.accountNumber,
                  bankAccountHolder: parsed.accountName
              };
          }
      } catch (e) {
          // Legacy string format
          bankMeta = { bankAccount: bankInfo };
      }

      const newTx: Transaction = {
          id: randomId('WDR'),
          userId: CURRENT_USER.id,
          type: TransactionType.WALLET_WITHDRAW,
          flow: TransactionFlow.OUT,
          amount,
          currency: 'VND',
          status: TransactionStatus.PENDING,
          source: 'WEB', // Rút tiền thủ công
          shortDescription: `Rút tiền về ${bankMeta.bankName || 'Ngân hàng'}`,
          metadata: bankMeta,
          createdAt: new Date().toLocaleString('vi-VN'),
          updatedAt: new Date().toLocaleString('vi-VN'),
          balanceBefore: CURRENT_USER.balance,
          balanceAfter: CURRENT_USER.balance - amount
      };
      TRANSACTIONS.unshift(newTx);
      CURRENT_USER.balance -= amount;
      return newTx;
  },

  createDepositRequest: async (gatewayId: string, amount: number) => {
      await new Promise(r => setTimeout(r, 1000));
      // In real app, returns QR code or payment URL
      const gw = PAYMENT_GATEWAYS.find(g => g.id === gatewayId);
      return { 
          orderId: randomId('DEP'), 
          amount, 
          qrUrl: `https://img.vietqr.io/image/${gw?.config.bankName}-${gw?.config.bankAccount}-compact2.png?amount=${amount}&addInfo=NAP ${randomId('DEP')}`,
          content: `NAP ${randomId('DEP')}`
      };
  },

  // Exchange
  exchangeCard: async (provider: string, code: string, serial: string, amount: number) => {
      await new Promise(r => setTimeout(r, 1500));
      // Simulate validation
      if (!provider || !code || !serial || !amount) throw new Error("Thiếu thông tin");
      
      const newTx: Transaction = {
          id: randomId('EXC'),
          userId: CURRENT_USER.id,
          type: TransactionType.CARD_EXCHANGE,
          flow: TransactionFlow.IN,
          amount: 0, // Pending calculation
          currency: 'VND',
          status: TransactionStatus.PROCESSING, 
          source: 'WEB', 
          shortDescription: `Đổi thẻ ${provider} ${amount.toLocaleString()}`,
          metadata: { provider, code, serial, declaredValue: amount },
          createdAt: new Date().toLocaleString('vi-VN'),
          updatedAt: new Date().toLocaleString('vi-VN'),
          balanceBefore: CURRENT_USER.balance,
          balanceAfter: CURRENT_USER.balance,
          timeline: [
              { id: randomId('ev'), status: TransactionStatus.PENDING, note: 'Tạo yêu cầu đổi thẻ', createdAt: new Date().toLocaleString('vi-VN') },
              { id: randomId('ev'), status: TransactionStatus.PROCESSING, note: `Đã gửi sang NCC`, createdAt: new Date().toLocaleString('vi-VN') }
          ]
      };
      
      TRANSACTIONS.unshift(newTx);
      return newTx;
  },

  // Shop
  buyCard: async (providerCode: string, value: number, quantity: number) => {
      await new Promise(r => setTimeout(r, 1500));
      const total = (value * 0.95) * quantity; // 5% discount
      if (CURRENT_USER.balance < total) throw new Error("Số dư không đủ");

      const newTx: Transaction = {
          id: randomId('BUY'),
          userId: CURRENT_USER.id,
          type: TransactionType.CARD_PURCHASE,
          flow: TransactionFlow.OUT,
          amount: total,
          currency: 'VND',
          status: TransactionStatus.SUCCESS,
          source: 'WEB', 
          shortDescription: `Mua ${quantity} thẻ ${providerCode} ${value.toLocaleString()}`,
          metadata: { provider: providerCode, value, quantity },
          createdAt: new Date().toLocaleString('vi-VN'),
          updatedAt: new Date().toLocaleString('vi-VN'),
          balanceBefore: CURRENT_USER.balance,
          balanceAfter: CURRENT_USER.balance - total
      };
      
      CURRENT_USER.balance -= total;
      TRANSACTIONS.unshift(newTx);
      
      // Return cards (Mocking response from Provider)
      const cards = Array(quantity).fill(0).map(() => ({
          code: Math.floor(Math.random() * 1000000000000).toString(),
          serial: Math.floor(Math.random() * 1000000000).toString(),
          value,
          expiry: '31/12/2025'
      }));
      
      return { transaction: newTx, cards };
  },

  // Common
  getProviders: async () => { await new Promise(r => setTimeout(r, DELAY)); return PROVIDERS; },
  getProducts: async () => { await new Promise(r => setTimeout(r, DELAY)); return PRODUCTS; },
  getNotifications: async () => { await new Promise(r => setTimeout(r, DELAY)); return NOTIFICATIONS; },
  getTickets: async () => { await new Promise(r => setTimeout(r, DELAY)); return TICKETS; },
  
  // Admin only
  getUserGroups: async () => { await new Promise(r => setTimeout(r, DELAY)); return USER_GROUPS; },
  
  saveUserGroup: async (group: UserGroup) => { 
      await new Promise(r => setTimeout(r, DELAY)); 
      const idx = USER_GROUPS.findIndex(g => g.id === group.id);
      if (idx !== -1) USER_GROUPS[idx] = group;
      else USER_GROUPS.push(group);
  },
  
  deleteUserGroup: async (id: string) => { 
      await new Promise(r => setTimeout(r, DELAY)); 
      const idx = USER_GROUPS.findIndex(g => g.id === id);
      if (idx !== -1) USER_GROUPS.splice(idx, 1);
  },
  
  // --- PROVIDER CONNECTION MANAGEMENT ---
  getApiConnections: async () => {
      await new Promise(r => setTimeout(r, DELAY));
      return API_CONNECTIONS;
  },
  saveApiConnection: async (conn: ApiConnection) => {
      await new Promise(r => setTimeout(r, DELAY));
      const idx = API_CONNECTIONS.findIndex(c => c.id === conn.id);
      if (idx !== -1) API_CONNECTIONS[idx] = conn;
      else API_CONNECTIONS.push({ ...conn, id: randomId('conn') });
  },
  deleteApiConnection: async (id: string) => {
      await new Promise(r => setTimeout(r, DELAY));
      const idx = API_CONNECTIONS.findIndex(c => c.id === id);
      if (idx !== -1) API_CONNECTIONS.splice(idx, 1);
  },
  
  updatePaymentGateway: async (id: string, data: Partial<PaymentGateway>) => {
      const idx = PAYMENT_GATEWAYS.findIndex(g => g.id === id);
      if (idx !== -1) {
          PAYMENT_GATEWAYS[idx] = { ...PAYMENT_GATEWAYS[idx], ...data };
      }
  },
  
  // --- User API Management ---
  getUserApiKeys: async () => { 
      await new Promise(r => setTimeout(r, DELAY));
      return USER_API_KEYS.filter(k => k.userId === CURRENT_USER.id); 
  },
  
  registerUserApiKey: async (data: Partial<UserApiKey>) => {
      await new Promise(r => setTimeout(r, DELAY));
      const newKey: UserApiKey = {
          id: randomId('k'),
          userId: CURRENT_USER.id,
          userName: CURRENT_USER.name,
          name: data.name || 'New Key',
          apiKey: `nt247_live_${Math.random().toString(36).substring(2, 15)}`,
          status: 'PENDING',
          modules: data.modules || ['EXCHANGE'],
          callbackUrl: data.callbackUrl || '',
          ipWhitelist: data.ipWhitelist || '',
          createdAt: new Date().toLocaleString('vi-VN')
      };
      USER_API_KEYS.push(newKey);
      return newKey;
  },
  
  getAdminUserApiKeys: async () => {
      await new Promise(r => setTimeout(r, DELAY));
      return USER_API_KEYS;
  },
  
  updateUserApiKeyStatus: async (id: string, status: 'ACTIVE' | 'LOCKED' | 'PENDING') => {
      await new Promise(r => setTimeout(r, DELAY));
      const idx = USER_API_KEYS.findIndex(k => k.id === id);
      if (idx !== -1) USER_API_KEYS[idx].status = status;
  },
  
  deleteUserApiKey: async (id: string) => {
      await new Promise(r => setTimeout(r, DELAY));
      const idx = USER_API_KEYS.findIndex(k => k.id === id);
      if (idx !== -1) USER_API_KEYS.splice(idx, 1);
  },
  
  updateProducts: async (updates: Partial<CardProduct>[]) => {
      updates.forEach(u => {
          const idx = PRODUCTS.findIndex(p => p.id === u.id);
          if (idx !== -1) PRODUCTS[idx] = { ...PRODUCTS[idx], ...u };
      });
  },

  // --- Inventory Management (Admin) ---
  getCardInventory: async () => {
      await new Promise(r => setTimeout(r, DELAY));
      return CARD_INVENTORY;
  },

  importCardCodes: async (providerCode: string, value: number, codes: {code: string, serial: string}[]) => {
      await new Promise(r => setTimeout(r, DELAY));
      const batchId = randomId('batch');
      const now = new Date().toLocaleString('vi-VN');
      const newCards = codes.map(c => ({
          id: randomId('card'),
          providerCode,
          value,
          code: c.code,
          serial: c.serial,
          expiryDate: '31/12/2025',
          status: CardCodeStatus.AVAILABLE,
          importBatchId: batchId,
          createdAt: now
      } as CardCode));
      
      CARD_INVENTORY.unshift(...newCards);
      return newCards.length;
  },

  deleteCardCode: async (id: string) => {
      await new Promise(r => setTimeout(r, DELAY));
      const idx = CARD_INVENTORY.findIndex(c => c.id === id);
      if (idx !== -1) CARD_INVENTORY.splice(idx, 1);
  },
  
  getKbArticles: async () => [],
  createKbArticle: async (article: Partial<KbArticle>) => ({ ...article, id: Date.now().toString(), views: 0 } as KbArticle),
  updateKbArticle: async () => {},
  deleteKbArticle: async () => {},
  
  getTicketDetails: async (id: string) => TICKETS.find(t => t.id === id),
  
  createTicket: async (ticket: Partial<SupportTicket>) => {
      const newTicket: SupportTicket = {
          id: `TIC-${Date.now()}`,
          userId: CURRENT_USER.id,
          userName: CURRENT_USER.name,
          subject: ticket.subject || 'No Subject',
          description: ticket.description || '',
          category: ticket.category || 'General',
          status: TicketStatus.NEW,
          priority: TicketPriority.MEDIUM,
          createdAt: new Date().toLocaleString('vi-VN'),
          updatedAt: new Date().toLocaleString('vi-VN'),
          messages: []
      };
      TICKETS.unshift(newTicket);
      return newTicket;
  },
  
  sendTicketMessage: async (ticketId: string, content: string, sender: 'USER' | 'AGENT') => {
      const msg = { id: Date.now().toString(), sender, content, timestamp: new Date().toLocaleTimeString('vi-VN') };
      return msg;
  },
  
  createNotification: async () => ({} as any),
  getAutoReplyConfig: async () => AUTO_REPLY_CONFIG,
  saveAutoReplyConfig: async (cfg: AutoReplyConfig) => { AUTO_REPLY_CONFIG = cfg },
  getCannedResponses: async () => [],
  createCannedResponse: async (res: Partial<CannedResponse>) => ({...res, id: Date.now().toString()} as CannedResponse),
  deleteCannedResponse: async () => {},
  createExchange: async () => {},
  guestLookupTransaction: async (code: string) => TRANSACTIONS.find(t => t.id === code),
  getLoginHistory: async () => [], // Simplified
  generateTwoFactorSecret: async () => ({secret: 'XYZ', otpauthUrl: ''}),
  verifyTwoFactorToken: async (token: string) => true,
  toggle2FA: async (enabled: boolean) => {},
  updateTransactionPin: async (pin: string) => {},
  getSystemAuditLogs: async () => [],
};