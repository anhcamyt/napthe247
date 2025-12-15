

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',         // Chờ xử lý (Hệ thống tiếp nhận)
  PROCESSING = 'PROCESSING',   // Đang xử lý (Đã gửi sang NCC)
  SUCCESS = 'SUCCESS',         // Thành công
  FAILED = 'FAILED',           // Thất bại (Thẻ sai, đã dùng)
  CANCELED = 'CANCELED',       // Hủy bỏ
  REFUNDED = 'REFUNDED',       // Hoàn tiền
  WRONG_VALUE = 'WRONG_VALUE', // Sai mệnh giá (Phạt)
  INVALID_FORMAT = 'INVALID_FORMAT' // Sai định dạng (Serial/Mã không hợp lệ)
}

export enum TransactionType {
  CARD_EXCHANGE = 'CARD_EXCHANGE',   // Đổi thẻ cào
  WALLET_TOPUP = 'WALLET_TOPUP',     // Nạp tiền ví (Bank)
  WALLET_WITHDRAW = 'WALLET_WITHDRAW', // Rút tiền ví
  CARD_PURCHASE = 'CARD_PURCHASE',   // Mua thẻ cào
  GAME_TOPUP = 'GAME_TOPUP',         // Nạp game
  GAME_PURCHASE = 'GAME_PURCHASE',   // Mua vật phẩm/account game
  VOUCHER_PURCHASE = 'VOUCHER_PURCHASE', // Mua voucher/giftcode
  REFUND = 'REFUND',                 // Hoàn tiền
  ADJUSTMENT = 'ADJUSTMENT',         // Admin điều chỉnh
  FEE = 'FEE',                       // Phí hệ thống
  FEE_PROCESSING = 'FEE_PROCESSING'  // Phí xử lý giao dịch
}

export enum TransactionFlow {
  IN = 'IN',   // Cộng tiền
  OUT = 'OUT'  // Trừ tiền
}

export interface UserGroup {
  id: string;
  name: string; // e.g. "Level 1", "VIP", "Đại lý"
  description?: string;
  color: string; // Tailwind class e.g. "bg-gray-100 text-gray-800"
  discountExchange: number; // % Bonus exchange rate
  discountShop: number; // % Bonus discount when buying
  minSpend?: number; // Auto-upgrade condition (optional)
}

export interface UserBankAccount {
  id: string;
  userId: string;
  bankName: string; // e.g. "MBBank", "Vietcombank"
  bankShortName?: string; // e.g. "MB", "VCB"
  accountNumber: string;
  accountName: string; // Chủ tài khoản
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  groupId: string; // Link to UserGroup
  groupName?: string; // Optional for display
  isPro?: boolean;
  security?: {
    twoFactorEnabled: boolean;
    hasTransactionPin: boolean;
    lastPasswordChange?: string;
  }
}

export interface LoginHistory {
  id: string;
  userId: string;
  device: string; // e.g. "Chrome on Windows"
  ip: string;
  location: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface SystemAuditLog {
  id: string;
  actorName: string; // Admin or User Name
  action: string; // e.g. "UPDATE_FEE", "APPROVE_WITHDRAW"
  target: string; // e.g. "Product #123"
  ip: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface CardProvider {
  id: string;
  name: string;
  code: string;
  color: string;
  type: 'TELCO' | 'GAME';
}

export interface CardProduct {
  id: string;
  providerCode: string;
  value: number;
  
  // User settings
  buyDiscount: number; // % chiết khấu khi mua
  exchangeRate: number; // % thực nhận khi đổi thẻ (User Rate)
  
  // Admin Config
  feesMode: 'AUTO' | 'MANUAL'; // Chế độ
  margin: number; // % Lợi nhuận mong muốn (User Rate = Upstream +/- Margin)
  
  // Routing Config (NEW)
  exchangeConnectionId?: string; // ID của ApiConnection để ĐỔI thẻ này
  storeConnectionId?: string;    // ID của ApiConnection để MUA thẻ này

  // Upstream / Cost Price (Mock data from Provider API)
  upstreamRate: number; // % Thực nhận từ nhà cung cấp gốc
  upstreamDiscount: number; // % Chiết khấu từ nhà cung cấp gốc
  
  status: 'ACTIVE' | 'MAINTENANCE';
}

// --- Inventory Module (New) ---
export enum CardCodeStatus {
  AVAILABLE = 'AVAILABLE', // Sẵn sàng bán
  SOLD = 'SOLD',           // Đã bán
  HELD = 'HELD',           // Đang giữ (chờ thanh toán)
  ERROR = 'ERROR'          // Lỗi thẻ
}

export interface CardCode {
  id: string;
  providerCode: string; // Liên kết logic với CardProvider.code
  value: number;        // Liên kết logic với CardProduct.value
  code: string;         // Mã thẻ (Cần mã hóa trong DB thực)
  serial: string;       // Số seri
  expiryDate: string;   // Hạn sử dụng
  status: CardCodeStatus;
  importBatchId?: string; // ID lô nhập
  soldToUserId?: string; // ID người mua (nếu đã bán)
  soldAt?: string;       // Thời gian bán
  createdAt: string;     // Thời gian nhập
}

// --- API Connections Types (System) ---
export enum ApiConnectionType {
  EXCHANGE = 'EXCHANGE',   // Nhà cung cấp đổi thẻ (Inbound)
  STORE = 'STORE',         // Kho thẻ mua (Outbound)
  SMS_GATEWAY = 'SMS_GATEWAY',     // SMS Brandname
  NOTIFICATION = 'NOTIFICATION',   // Bot Telegram, Discord
}

export interface ApiConnection {
  id: string;
  name: string; // e.g. "TichHop247"
  code: string; // Internal reference code
  type: ApiConnectionType;
  baseUrl: string;
  username?: string; // Partner ID
  apiKey?: string;
  secretKey?: string; // Callback Sign Key
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  priority: number; // 1 = Highest, used for fallback
  balance: number; // Số dư hiện tại ở NCC
  lastCheck?: string;
  webhookUrl?: string; // URL để NCC gọi lại
}

// --- Payment Gateway Types (New) ---
export enum PaymentFlow {
  INBOUND = 'INBOUND', // Nạp tiền
  OUTBOUND = 'OUTBOUND' // Rút tiền
}

export enum PaymentMethodType {
  BANK_TRANSFER = 'BANK_TRANSFER', // Chuyển khoản ngân hàng (VietQR/Auto Bank)
  E_WALLET = 'E_WALLET',           // Ví điện tử (Momo, ZaloPay)
  CRYPTO = 'CRYPTO',               // Tiền ảo (USDT)
  CARD = 'CARD'                    // Thẻ quốc tế/ATM (Ít dùng cho site đổi thẻ nhưng có thể có)
}

export interface PaymentGatewayConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'select';
  options?: string[]; // For select type
  placeholder?: string;
  required?: boolean;
}

export interface PaymentGateway {
  id: string;
  code: string; // e.g. 'CASSO', 'MOMO_BUSINESS', 'SEPAYS'
  name: string;
  flow: PaymentFlow;
  methodType: PaymentMethodType;
  logo?: string;
  
  // Status
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  
  // Fee & Limits
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  feeFixed: number;
  
  // Connection Config (Values stored here)
  config: Record<string, any>; 
  
  // Config Schema (For UI generation)
  configFields: PaymentGatewayConfigField[];
  
  // Additional Info
  description?: string;
  autoApprove: boolean; // Tự động duyệt lệnh rút tiền?
}

// --- User API Keys (For User Integration) ---
export interface UserApiKey {
  id: string;
  userId: string;
  userName?: string; // For Admin display
  name: string; // e.g. "Shop Acc FreeFire"
  apiKey: string;
  callbackUrl?: string; // Webhook URL
  ipWhitelist?: string; // Allowed IPs
  modules: ('EXCHANGE' | 'SHOP')[]; // Quyền: Gửi thẻ hoặc Mua thẻ
  status: 'PENDING' | 'ACTIVE' | 'LOCKED';
  createdAt: string;
}

// --- Ledger System Types ---

export interface TransactionEvent {
  id: string;
  status: TransactionStatus;
  note: string;
  createdAt: string;
}

export interface TransactionDetailMetadata {
  provider?: string;
  serial?: string;
  code?: string; // Masked in summary, full in detail
  bankName?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  gameId?: string;
  fee?: number;
  adminNote?: string;
  providerTxId?: string; // Mã GD bên NCC
  providerName?: string; // Tên NCC xử lý
  [key: string]: any;
}

export interface Transaction {
  id: string;
  userId?: string; // Nullable for guest
  type: TransactionType;
  flow: TransactionFlow;
  amount: number;
  currency: string;
  status: TransactionStatus;
  source?: 'WEB' | 'API'; // Nguồn giao dịch
  requestId?: string;     // Client's Request ID (nếu qua API)
  balanceBefore?: number;
  balanceAfter?: number;
  shortDescription: string; // For Table View
  fullDescription?: string; // For Detail View
  metadata?: TransactionDetailMetadata; // JSON data
  timeline?: TransactionEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  label: string;
  icon: any;
  path: string;
}

// --- Support Types ---
export enum TicketStatus {
  NEW = 'NEW',
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'AGENT' | 'BOT';
  content: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userName?: string; // For Admin UI
  subject: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface KbArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  views: number;
}

// --- New Support Center Types ---

export interface Notification {
  id: string;
  targetGroup: string; // 'ALL', 'LEVEL_1', etc.
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'PROMO';
  sentAt: string;
  sentBy: string;
}

export interface AutoReplyConfig {
  enabled: boolean;
  offlineMode: boolean; // Only auto-reply outside office hours
  welcomeMessage: string;
  offlineMessage: string;
  
  // AI Settings
  useAi: boolean;
  aiProvider: 'OPENAI' | 'GEMINI'; // Configurable provider
  aiPersonality?: string; // Shared System Instruction

  // OpenAI Specifics
  openAiApiKey?: string;
  aiModel?: string; // 'gpt-3.5-turbo' | 'gpt-4'

  // Gemini Specifics
  geminiApiKey?: string;
  geminiModel?: string; // 'gemini-1.5-flash' | 'gemini-pro'
}

export interface CannedResponse {
  id: string;
  shortcut: string; // e.g. "/bank"
  content: string;
  category: string; // e.g. "Finance"
}