import React, { ReactNode, useMemo } from 'react';
import { Transaction, TransactionStatus, TransactionType, TransactionFlow } from '../types';
import { Badge, Button, Card } from './UIComponents';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, History, RefreshCcw, CreditCard, ShieldAlert, CheckCircle2, XCircle, Clock, FileText, Download, PieChart, BarChart3, TrendingUp, AlertTriangle, MessageSquarePlus, Globe, Server, Hash } from 'lucide-react';

// --- Helper Functions ---

export const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case TransactionType.CARD_EXCHANGE: return <RefreshCcw size={18} />;
    case TransactionType.CARD_PURCHASE: return <ShoppingBag size={18} />;
    case TransactionType.WALLET_TOPUP: return <ArrowDownLeft size={18} />;
    case TransactionType.WALLET_WITHDRAW: return <ArrowUpRight size={18} />;
    case TransactionType.REFUND: return <History size={18} />;
    default: return <CreditCard size={18} />;
  }
};

export const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case TransactionType.WALLET_TOPUP:
    case TransactionType.CARD_EXCHANGE:
    case TransactionType.REFUND:
      return 'bg-green-100 text-green-700';
    case TransactionType.WALLET_WITHDRAW:
    case TransactionType.CARD_PURCHASE:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const TransactionStatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return <Badge variant="success">Thành công</Badge>;
    case TransactionStatus.PENDING:
      return <Badge variant="warning" className="bg-yellow-50 text-yellow-700 border-yellow-200">Chờ xử lý</Badge>;
    case TransactionStatus.PROCESSING:
      return <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">Đang xử lý</Badge>;
    case TransactionStatus.FAILED:
      return <Badge variant="error">Thất bại</Badge>; // Thẻ sai / Đã dùng
    case TransactionStatus.REFUNDED:
      return <Badge variant="info">Hoàn tiền</Badge>;
    case TransactionStatus.WRONG_VALUE:
      return <Badge variant="warning" className="bg-orange-100 text-orange-800 border-orange-200">Sai mệnh giá</Badge>;
    case TransactionStatus.INVALID_FORMAT:
      return <Badge variant="default" className="bg-gray-200 text-gray-700 border-gray-300">Sai định dạng</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

// --- Transaction Analytics Component (New) ---

interface AnalyticsProps {
  transactions: Transaction[];
}

export const TransactionAnalytics: React.FC<AnalyticsProps> = ({ transactions }) => {
  // Logic tổng hợp dữ liệu
  const stats = useMemo(() => {
    const data = {
      totalIn: 0,
      totalOut: 0,
      exchange: {
        totalAmount: 0,
        totalCount: 0,
        providers: {} as Record<string, { amount: number; count: number; denoms: Record<string, number> }>
      },
      shop: {
        totalAmount: 0,
        totalCount: 0,
        providers: {} as Record<string, { amount: number; count: number; denoms: Record<string, number> }>
      }
    };

    transactions.forEach(tx => {
      // Chỉ tính giao dịch thành công hoặc sai mệnh giá (vẫn cộng tiền) cho báo cáo
      if (tx.status !== TransactionStatus.SUCCESS && tx.status !== TransactionStatus.WRONG_VALUE) return;

      // Tổng quan dòng tiền
      if (tx.flow === TransactionFlow.IN) data.totalIn += tx.amount;
      else data.totalOut += tx.amount;

      // Phân tích chi tiết Đổi thẻ & Mua thẻ
      if (tx.type === TransactionType.CARD_EXCHANGE || tx.type === TransactionType.CARD_PURCHASE) {
        const group = tx.type === TransactionType.CARD_EXCHANGE ? data.exchange : data.shop;
        const provider = tx.metadata?.provider || 'KHÁC';
        
        // Mệnh giá: Ưu tiên lấy declaredValue (mệnh giá thực) cho đổi thẻ, hoặc suy từ amount
        const denom = tx.metadata?.declaredValue || tx.metadata?.value || tx.amount; 

        if (!group.providers[provider]) {
          group.providers[provider] = { amount: 0, count: 0, denoms: {} };
        }

        group.totalAmount += tx.amount;
        group.totalCount += 1;
        
        const pStats = group.providers[provider];
        pStats.amount += tx.amount;
        pStats.count += 1;
        pStats.denoms[denom] = (pStats.denoms[denom] || 0) + 1;
      }
    });

    return data;
  }, [transactions]);

  if (transactions.length === 0) return null;

  const renderProviderStats = (
    title: string, 
    total: number, 
    providers: Record<string, { amount: number; count: number; denoms: Record<string, number> }>
  ) => {
    const sortedProviders = Object.entries(providers).sort(([,a], [,b]) => b.amount - a.amount);
    
    return (
      <Card className="flex-1">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
           {title.includes('Đổi thẻ') ? <RefreshCcw className="text-green-600" size={20}/> : <ShoppingBag className="text-blue-600" size={20}/>}
           <div>
             <h3 className="font-bold text-gray-900">{title}</h3>
             <p className="text-xs text-gray-500">Tổng: <span className="font-bold text-gray-900">{total.toLocaleString()}đ</span></p>
           </div>
        </div>
        
        <div className="space-y-6">
          {sortedProviders.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Không có dữ liệu</p>}
          {sortedProviders.map(([name, stat]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
               {/* Provider Header */}
               <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                     <Badge variant="default" className="font-bold">{name}</Badge>
                     <span className="text-xs text-gray-500">({stat.count} thẻ)</span>
                  </div>
                  <span className={`font-bold text-sm ${title.includes('Đổi thẻ') ? 'text-green-700' : 'text-blue-700'}`}>
                    {stat.amount.toLocaleString()}đ
                  </span>
               </div>
               
               {/* Progress Bar (Visual share) */}
               <div className="w-full bg-gray-200 h-1.5 rounded-full mb-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${title.includes('Đổi thẻ') ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(stat.amount / total) * 100}%` }}
                  ></div>
               </div>

               {/* Detailed Denominations Table */}
               <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2 rounded border border-gray-100">
                  <div className="text-gray-400 font-medium">Mệnh giá</div>
                  <div className="text-gray-400 font-medium text-center">SL</div>
                  <div className="text-gray-400 font-medium text-right">Thành tiền (est)</div>
                  
                  {Object.entries(stat.denoms)
                    .sort(([d1], [d2]) => Number(d1) - Number(d2))
                    .map(([denom, count]) => (
                      <React.Fragment key={denom}>
                        <div className="font-mono text-gray-900">{Number(denom).toLocaleString()}</div>
                        <div className="text-center font-semibold text-gray-700">x{count}</div>
                        <div className="text-right text-gray-500">
                           ~{(Number(denom) * count).toLocaleString()}
                        </div>
                      </React.Fragment>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4 mb-6 animate-in slide-in-from-top-4 duration-300">
       {/* Summary Header Cards */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
             <div className="text-green-600 text-xs font-bold uppercase mb-1">Tổng thực nhận (IN)</div>
             <div className="text-2xl font-bold text-gray-900">{stats.totalIn.toLocaleString()}đ</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
             <div className="text-red-600 text-xs font-bold uppercase mb-1">Tổng chi tiêu (OUT)</div>
             <div className="text-2xl font-bold text-gray-900">{stats.totalOut.toLocaleString()}đ</div>
          </div>
       </div>

       {/* Detailed Columns */}
       <div className="flex flex-col md:flex-row gap-4">
          {renderProviderStats('Thống kê Đổi thẻ', stats.exchange.totalAmount, stats.exchange.providers)}
          {renderProviderStats('Thống kê Mua mã thẻ', stats.shop.totalAmount, stats.shop.providers)}
       </div>
    </div>
  );
};

// --- Transaction Detail Content (Page View) ---

interface TransactionDetailContentProps {
  transaction: Transaction;
  isAdmin?: boolean;
  onReport?: () => void;
}

export const TransactionDetailContent: React.FC<TransactionDetailContentProps> = ({ 
  transaction,
  isAdmin = false,
  onReport
}) => {
  const isPositive = transaction.flow === TransactionFlow.IN;

  // Danh sách các key cần ẩn với người dùng thường
  const SENSITIVE_KEYS = [
    'providerName', 
    'providerTxId', 
    'upstreamRate', 
    'upstreamDiscount',
    'exchangeConnectionId', 
    'storeConnectionId', 
    'adminNote'
  ];

  const formatKeyName = (key: string) => {
      const map: Record<string, string> = {
          provider: 'Nhà mạng',
          serial: 'Số Seri',
          code: 'Mã thẻ',
          declaredValue: 'Mệnh giá gửi',
          realValue: 'Mệnh giá thực',
          value: 'Mệnh giá',
          quantity: 'Số lượng',
          bankName: 'Ngân hàng',
          bankAccount: 'Số tài khoản',
          fee: 'Phí',
          note: 'Ghi chú'
      };
      return map[key] || key.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${getTransactionColor(transaction.type)}`}>
              {getTransactionIcon(transaction.type)}
           </div>
           <h2 className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-gray-900'}`}>
              {isPositive ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.currency}
           </h2>
           <p className="text-sm text-gray-500 font-medium mt-1">{transaction.shortDescription}</p>
           <div className="mt-3">
              <TransactionStatusBadge status={transaction.status} />
           </div>
           
           {/* Hiển thị cảnh báo sai mệnh giá */}
           {transaction.status === TransactionStatus.WRONG_VALUE && (
               <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
                   <ShieldAlert size={16}/>
                   <span>Lỗi: Khai báo {transaction.metadata?.declaredValue?.toLocaleString()}đ, Thực tế {transaction.metadata?.realValue?.toLocaleString()}đ</span>
               </div>
           )}

           {/* Hiển thị lỗi sai định dạng */}
           {transaction.status === TransactionStatus.INVALID_FORMAT && (
               <div className="mt-4 bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
                   <AlertTriangle size={16}/>
                   <span>Lỗi: Sai định dạng mã thẻ hoặc số seri.</span>
               </div>
           )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
           <div className="p-3 border border-gray-100 rounded-lg">
              <span className="block text-gray-500 text-xs mb-1">Mã tham chiếu</span>
              <span className="font-mono font-medium text-gray-900 select-all">{transaction.id}</span>
           </div>
           <div className="p-3 border border-gray-100 rounded-lg">
              <span className="block text-gray-500 text-xs mb-1">Thời gian</span>
              <span className="font-medium text-gray-900">{transaction.createdAt}</span>
           </div>
           
           {/* Hiển thị hình thức giao dịch */}
           <div className="p-3 border border-gray-100 rounded-lg">
              <span className="block text-gray-500 text-xs mb-1">Hình thức</span>
              <span className="font-medium text-gray-900 flex items-center gap-1.5">
                {transaction.source === 'API' ? <Server size={14} className="text-purple-600"/> : <Globe size={14} className="text-blue-600"/>}
                {transaction.source === 'API' ? 'API Tích hợp' : 'Website'}
              </span>
           </div>

           {/* Hiển thị Request ID nếu là API */}
           {transaction.source === 'API' && transaction.requestId ? (
               <div className="p-3 border border-gray-100 rounded-lg">
                  <span className="block text-gray-500 text-xs mb-1">Request ID</span>
                  <span className="font-mono font-bold text-purple-700 text-xs break-all flex items-center gap-1">
                     <Hash size={10} /> {transaction.requestId}
                  </span>
               </div>
           ) : (
                // Placeholder nếu không có RequestID để giữ layout grid đẹp
               <div className="p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                  <span className="block text-gray-400 text-xs mb-1">Thông tin thêm</span>
                  <span className="font-medium text-gray-400 text-xs">--</span>
               </div>
           )}

           {transaction.balanceBefore !== undefined && (
             <>
               <div className="p-3 border border-gray-100 rounded-lg">
                  <span className="block text-gray-500 text-xs mb-1">Số dư trước</span>
                  <span className="font-medium text-gray-500">{transaction.balanceBefore.toLocaleString()}</span>
               </div>
               <div className="p-3 border border-gray-100 rounded-lg">
                  <span className="block text-gray-500 text-xs mb-1">Số dư sau</span>
                  <span className="font-medium text-gray-900">{transaction.balanceAfter?.toLocaleString()}</span>
               </div>
             </>
           )}
        </div>

        {/* Deep Details (JSON Metadata) */}
        {transaction.metadata && (
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
               <FileText size={16}/> Thông tin chi tiết
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
               {Object.entries(transaction.metadata).map(([key, value], idx) => {
                 // Ẩn thông tin nhạy cảm nếu không phải admin
                 if (!isAdmin && SENSITIVE_KEYS.includes(key)) return null;
                 
                 return (
                    <div key={key} className={`flex justify-between p-3 text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <span className="text-gray-500 capitalize">{formatKeyName(key)}</span>
                        <span className="font-medium text-gray-900 text-right break-all ml-4">{String(value)}</span>
                    </div>
                 );
               })}
            </div>
          </div>
        )}

        {/* Timeline */}
        {transaction.timeline && transaction.timeline.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
               <Clock size={16}/> Tiến trình xử lý
            </h4>
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
               {transaction.timeline.map((event, idx) => (
                  <div key={event.id} className="relative">
                     <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ${
                        event.status === TransactionStatus.SUCCESS ? 'bg-green-500' :
                        event.status === TransactionStatus.WRONG_VALUE ? 'bg-orange-500' :
                        event.status === TransactionStatus.FAILED ? 'bg-red-500' : 
                        event.status === TransactionStatus.INVALID_FORMAT ? 'bg-gray-400' : 'bg-blue-500'
                     }`}></div>
                     <p className="text-xs text-gray-400 mb-0.5">{event.createdAt}</p>
                     <p className="text-sm font-medium text-gray-900">{event.note}</p>
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
           {onReport && (
               <Button variant="outline" size="sm" className="mr-auto text-orange-600 border-orange-200 hover:bg-orange-50" onClick={onReport}>
                   <MessageSquarePlus size={16} className="mr-2"/> Khiếu nại đơn
               </Button>
           )}
           
           <Button variant="ghost" size="sm" onClick={() => alert('Download PDF')}>
              <Download size={16} className="mr-2"/> Xuất hóa đơn
           </Button>
           
           {isAdmin && (transaction.status === TransactionStatus.SUCCESS || transaction.status === TransactionStatus.WRONG_VALUE) && (
              <Button variant="danger" size="sm" onClick={() => alert('Refund Logic')}>
                 Hoàn tiền
              </Button>
           )}
        </div>
    </div>
  );
};

// --- Summary Table ---

interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetail: (tx: Transaction) => void;
  className?: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onViewDetail, className = '' }) => {
  return (
    <>
      {/* MOBILE VIEW (Card List) */}
      <div className={`md:hidden space-y-3 ${className}`}>
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            onClick={() => onViewDetail(tx)}
            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                     {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                     <div className="font-semibold text-gray-900 text-sm line-clamp-1">{tx.shortDescription}</div>
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                        {tx.createdAt}
                        {tx.source === 'API' && <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold ml-1">API</span>}
                     </div>
                  </div>
               </div>
               <div className="text-right flex-shrink-0">
                   <div className={`font-bold text-sm ${tx.flow === TransactionFlow.IN ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.flow === TransactionFlow.IN ? '+' : '-'}{tx.amount.toLocaleString()}
                   </div>
               </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100">
               <span className="font-mono text-xs text-gray-400">#{tx.id}</span>
               <TransactionStatusBadge status={tx.status} />
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
           <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
              Không có giao dịch nào
           </div>
        )}
      </div>

      {/* DESKTOP VIEW (Table) */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Giao dịch</th>
              <th className="px-4 py-3 font-medium">Kênh</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Số tiền</th>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tx.shortDescription}</div>
                      <div className="text-xs text-gray-500 font-mono">{tx.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                    {tx.source === 'API' ? (
                        <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-1 rounded w-fit">
                            <Server size={12}/> <span className="font-bold">API</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit">
                            <Globe size={12}/> <span>Web</span>
                        </div>
                    )}
                </td>
                <td className="px-4 py-3">
                  <TransactionStatusBadge status={tx.status} />
                </td>
                <td className={`px-4 py-3 text-right font-medium ${tx.flow === TransactionFlow.IN ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.flow === TransactionFlow.IN ? '+' : '-'}{tx.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {tx.createdAt}
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => onViewDetail(tx)}
                    className="text-primary-600 hover:text-primary-800 font-medium text-xs border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
               <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Không có giao dịch nào</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};