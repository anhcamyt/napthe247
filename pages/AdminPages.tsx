import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AdminShell } from '../components/Layouts';
import { Card, Badge, Button, Input, Select, Modal, Tabs, Switch, useToast, ListItem, PinInput } from '../components/UIComponents';
import { BarChart, Users, DollarSign, Activity, Search, Filter, Eye, MoreVertical, Plus, AlertTriangle, FileText, Database, Crown, Trash2, Edit, Link2, Globe, Lock, Landmark, CreditCard, MessageSquare, Bell, Plug, Shield, QrCode, Settings, Zap, Send, Paperclip, Clock, Brain, BookOpen, Banknote, Bitcoin, CheckCircle, User as UserIcon, HelpCircle, Key, Unlock, ShoppingBag, EyeOff, Package, Server, Shuffle, Hash, CheckCircle2, ChevronRight, Copy, RefreshCcw, ArrowRight, Percent } from 'lucide-react';
import { mockApi } from '../services/api';
import { User, UserRole, UserGroup, ApiConnection, ApiConnectionType, PaymentGateway, PaymentFlow, PaymentMethodType, KbArticle, SupportTicket, TicketStatus, Transaction, CannedResponse, AutoReplyConfig, CardProvider, CardProduct, UserApiKey, CardCode, CardCodeStatus, TransactionType, TransactionStatus, TransactionFlow } from '../types';
import { useNavigate } from 'react-router-dom';
import { PricingMatrix } from '../components/PricingUI';
import { RouteMatrix } from '../components/RouteConfigUI';
import { TransactionDetailContent, getTransactionIcon, getTransactionColor, TransactionStatusBadge } from '../components/TransactionUI';

// --- Generic Admin Page (Placeholder) ---
export const AdminGenericList: React.FC<{ title: string }> = ({ title }) => {
  return (
    <AdminShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <Button size="sm" variant="outline">Tùy chọn</Button>
      </div>
      
      <Card className="min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-dashed">
         <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
            <Database size={32} className="text-gray-300"/>
         </div>
         <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có dữ liệu</h3>
         <p className="text-sm text-gray-500">Danh sách {title.toLowerCase()} đang trống hoặc đang được xây dựng.</p>
      </Card>
    </AdminShell>
  );
};

// --- Documentation / Guide Page ---
export const AdminDocumentationPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('intro');

    const sections = [
        { id: 'intro', title: 'Tổng quan hệ thống', icon: Activity },
        { id: 'routing', title: 'Phân luồng thẻ (Routing)', icon: Shuffle },
        { id: 'pricing', title: 'Cấu hình giá & phí', icon: Percent },
        { id: 'connections', title: 'Kết nối Nhà cung cấp', icon: Link2 },
        { id: 'transactions', title: 'Xử lý giao dịch lỗi', icon: AlertTriangle },
        { id: 'withdrawals', title: 'Duyệt rút tiền', icon: Banknote },
    ];

    const renderContent = () => {
        switch(activeSection) {
            case 'intro': return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Chào mừng đến với Admin Portal NapThe247</h2>
                        <p className="text-gray-600 mb-4">Đây là hệ thống quản trị trung tâm, cho phép bạn kiểm soát toàn bộ luồng giao dịch, cấu hình sản phẩm và quản lý thành viên.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-blue-50 border-blue-100">
                                <h3 className="font-bold text-blue-800 mb-2">Inbound (Nạp/Đổi thẻ)</h3>
                                <p className="text-xs text-blue-600">Quản lý các giao dịch người dùng nạp tiền qua Thẻ cào hoặc Bank. Cấu hình tại menu <strong>Cấu hình luồng thẻ</strong> và <strong>Cổng thanh toán</strong>.</p>
                            </Card>
                            <Card className="bg-green-50 border-green-100">
                                <h3 className="font-bold text-green-800 mb-2">Outbound (Rút/Mua)</h3>
                                <p className="text-xs text-green-600">Kiểm soát tiền ra. Phê duyệt lệnh rút tiền và giám sát kho thẻ bán ra (Softpin).</p>
                            </Card>
                            <Card className="bg-purple-50 border-purple-100">
                                <h3 className="font-bold text-purple-800 mb-2">Ledger (Sổ cái)</h3>
                                <p className="text-xs text-purple-600">Hệ thống ghi nhận Transaction bất biến. Đảm bảo số dư người dùng luôn chính xác tuyệt đối.</p>
                            </Card>
                        </div>
                    </div>
                </div>
            );
            case 'routing': return (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Shuffle className="text-primary-600"/> Cấu hình phân luồng thẻ
                    </h2>
                    <Card className="prose prose-sm max-w-none">
                        <p>Tính năng quan trọng nhất để tối ưu lợi nhuận. Cho phép bạn định tuyến thẻ cào (User gửi lên) hoặc đơn mua thẻ sang các đối tác (NCC) khác nhau dựa trên mệnh giá và loại thẻ.</p>
                        
                        <h4 className="font-bold text-gray-900 mt-4">Cách hoạt động:</h4>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Truy cập menu <strong>Cấu hình luồng thẻ</strong>.</li>
                            <li>Bảng ma trận hiển thị: Hàng dọc là Nhà mạng, Hàng ngang là Mệnh giá.</li>
                            <li>Ô giao nhau hiển thị tên kênh kết nối hiện tại (VD: TichHop247, Banthe247).</li>
                            <li>Bấm <strong>Sửa luồng</strong> để thay đổi kênh xử lý cho từng ô.</li>
                            <li>Sử dụng chức năng <Settings size={12} className="inline"/> cạnh tên nhà mạng để thay đổi hàng loạt cho tất cả mệnh giá.</li>
                        </ol>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-4">
                            <strong className="text-yellow-800 block mb-1">Lưu ý quan trọng:</strong>
                            <ul className="list-disc pl-5 text-yellow-700 text-xs space-y-1">
                                <li>Nếu một ô hiển thị màu đỏ hoặc trống, thẻ đó sẽ bị từ chối ngay lập tức khi user gửi lên.</li>
                                <li>Nên cấu hình ít nhất 2 kênh kết nối để có thể chuyển đổi nhanh khi một bên bảo trì.</li>
                            </ul>
                        </div>
                    </Card>
                </div>
            );
            case 'pricing': return (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Percent className="text-primary-600"/> Cấu hình Giá & Phí
                    </h2>
                    <Card className="space-y-4">
                        <p className="text-sm text-gray-600">Quản lý tỷ lệ chiết khấu (Phí đổi thẻ) và giá bán thẻ. Hệ thống hỗ trợ 2 chế độ:</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span className="font-bold text-blue-700">Chế độ AUTO</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    Giá tự động cập nhật theo NCC + Biên lợi nhuận (Margin) bạn cài đặt.
                                </p>
                                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                                    User Rate = Provider Rate - Margin
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    <span className="font-bold text-orange-700">Chế độ MANUAL</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    Giá cố định do bạn nhập tay. Không thay đổi kể cả khi NCC thay đổi giá.
                                </p>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-900 text-sm mt-2">Hướng dẫn thao tác:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            <li>Vào menu <strong>Cấu hình bảng phí</strong>.</li>
                            <li>Bấm nút <strong>Sửa phí</strong> để vào chế độ chỉnh sửa.</li>
                            <li>Click vào icon <Lock size={12} className="inline"/> / <Unlock size={12} className="inline"/> trên từng ô giá để chuyển đổi chế độ Auto/Manual.</li>
                            <li>Nhập số dương. Ví dụ nhập <code>15</code> nghĩa là phí 15%, user nhận 85%.</li>
                        </ul>
                    </Card>
                </div>
            );
            case 'connections': return (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Link2 className="text-primary-600"/> Kết nối API (Nhà cung cấp)
                    </h2>
                    <Card className="text-sm text-gray-600 space-y-4">
                        <p>Để hệ thống hoạt động, bạn cần kết nối với các "Nhà cái" (Upstream Providers). Các thông tin cần thiết thường bao gồm:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Base URL:</strong> Địa chỉ API của đối tác.</li>
                            <li><strong>Partner ID:</strong> Tên tài khoản hoặc ID đại lý.</li>
                            <li><strong>API Key & Secret Key:</strong> Dùng để xác thực và ký (sign) dữ liệu.</li>
                        </ul>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                            <strong className="text-blue-800 block mb-2">Quy trình thêm kết nối mới:</strong>
                            <ol className="list-decimal pl-5 text-blue-700 space-y-1">
                                <li>Đăng ký tài khoản tại site đối tác (VD: TichHop247).</li>
                                <li>Lấy thông tin kết nối trong phần "Kết nối API" của họ.</li>
                                <li>Vào menu <strong>Kết nối API</strong> trên trang này -> <strong>Thêm kết nối</strong>.</li>
                                <li>Điền thông tin và lưu lại.</li>
                                <li>Copy <strong>Webhook URL</strong> của hệ thống mình dán ngược lại vào cấu hình bên đối tác để nhận kết quả trả về.</li>
                            </ol>
                        </div>
                    </Card>
                </div>
            );
            case 'transactions': return (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="text-primary-600"/> Xử lý giao dịch lỗi
                    </h2>
                    <div className="space-y-4">
                        <Card>
                            <h3 className="font-bold text-gray-900 mb-2 text-sm">Trạng thái: Sai mệnh giá (WRONG_VALUE)</h3>
                            <p className="text-sm text-gray-600 mb-2">Xảy ra khi user khai báo thẻ 100k nhưng thực tế thẻ là 50k. Hệ thống tự động phạt (nếu cấu hình) và cộng tiền theo thực tế.</p>
                            <div className="flex gap-2">
                                <Badge variant="warning">Hành động</Badge>
                                <span className="text-sm">Kiểm tra log chi tiết -> Nếu cần hoàn tiền chênh lệch, dùng chức năng "Hoàn tiền" trong chi tiết đơn.</span>
                            </div>
                        </Card>
                        <Card>
                            <h3 className="font-bold text-gray-900 mb-2 text-sm">Trạng thái: Thất bại (FAILED)</h3>
                            <p className="text-sm text-gray-600 mb-2">Thẻ sai, đã sử dụng hoặc bị khóa. User không nhận được tiền.</p>
                            <div className="flex gap-2">
                                <Badge variant="error">Hành động</Badge>
                                <span className="text-sm">Nếu user khiếu nại thẻ đúng, hãy copy Seri/Mã thẻ và chat với Support của kênh gạch thẻ (NCC) để check lại.</span>
                            </div>
                        </Card>
                    </div>
                </div>
            );
            default: return null;
        }
    }

    return (
        <AdminShell>
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <Card noPadding className="h-full overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen size={18}/> Mục lục
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        activeSection === section.id 
                                        ? 'bg-primary-50 text-primary-700' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <section.icon size={16} />
                                    {section.title}
                                    {activeSection === section.id && <ChevronRight size={14} className="ml-auto"/>}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </AdminShell>
    );
};

// --- Dashboard ---
export const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Doanh thu ngày', value: '128.5 Tr', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Đơn chờ duyệt', value: '14', icon: Activity, color: 'bg-orange-100 text-orange-600' },
    { label: 'Thành viên mới', value: '12', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Tổng lợi nhuận', value: '12.4 Tr', icon: BarChart, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex items-center p-4">
            <div className={`p-3 rounded-xl mr-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h4 className="text-xl font-bold text-gray-900">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col justify-center items-center text-gray-400 bg-white border-dashed">
          <p>Biểu đồ doanh thu (Coming soon)</p>
        </Card>
        <Card className="h-80 flex flex-col justify-center items-center text-gray-400 bg-white border-dashed">
           <p>Biểu đồ sản lượng thẻ (Coming soon)</p>
        </Card>
      </div>
    </AdminShell>
  );
};

// --- Transactions Management (Merged) ---
export const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    Promise.all([
      mockApi.getTransactions(),
      mockApi.getAllUsers()
    ]).then(([txs, usrs]) => {
      setTransactions(txs);
      setUsers(usrs);
    });
  }, []);

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'Khách vãng lai';
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const searchMatch = !searchText || 
        tx.id.toLowerCase().includes(searchText.toLowerCase()) || 
        (tx.requestId && tx.requestId.toLowerCase().includes(searchText.toLowerCase())) ||
        getUserName(tx.userId).toLowerCase().includes(searchText.toLowerCase()) ||
        tx.shortDescription.toLowerCase().includes(searchText.toLowerCase());
        
      const typeMatch = filterType === 'ALL' || tx.type === filterType;
      const statusMatch = filterStatus === 'ALL' || tx.status === filterStatus;
      
      return searchMatch && typeMatch && statusMatch;
    });
  }, [transactions, searchText, filterType, filterStatus, users]);

  // Helper function for Mobile UI Distinction
  const getTxStyle = (type: TransactionType) => {
      switch(type) {
          case TransactionType.CARD_EXCHANGE:
              return { border: 'border-green-500', text: 'text-green-700', bg: 'bg-green-500', icon: <RefreshCcw size={14} className="text-white"/> };
          case TransactionType.CARD_PURCHASE:
              return { border: 'border-purple-500', text: 'text-purple-700', bg: 'bg-purple-500', icon: <ShoppingBag size={14} className="text-white"/> };
          case TransactionType.WALLET_TOPUP:
              return { border: 'border-blue-500', text: 'text-blue-700', bg: 'bg-blue-500', icon: <DollarSign size={14} className="text-white"/> };
          case TransactionType.WALLET_WITHDRAW:
              return { border: 'border-orange-500', text: 'text-orange-700', bg: 'bg-orange-500', icon: <Banknote size={14} className="text-white"/> };
          default:
              return { border: 'border-gray-400', text: 'text-gray-700', bg: 'bg-gray-500', icon: <Activity size={14} className="text-white"/> };
      }
  };

  // Helper for Status Badge in Mobile View
  const MobileStatusBadge = ({ status }: { status: TransactionStatus }) => {
      const config = {
          [TransactionStatus.SUCCESS]: { text: 'Thành công', color: 'text-green-600' },
          [TransactionStatus.PENDING]: { text: 'Chờ duyệt', color: 'text-yellow-600' },
          [TransactionStatus.PROCESSING]: { text: 'Đang xử lý', color: 'text-blue-600' },
          [TransactionStatus.FAILED]: { text: 'Thất bại', color: 'text-red-600' },
          [TransactionStatus.WRONG_VALUE]: { text: 'Sai mệnh giá', color: 'text-orange-600' },
          [TransactionStatus.INVALID_FORMAT]: { text: 'Sai định dạng', color: 'text-gray-600' },
      }[status] || { text: status, color: 'text-gray-600' };

      return <span className={`text-[10px] font-bold uppercase ${config.color}`}>{config.text}</span>;
  };

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
           <p className="text-sm text-gray-500">Quản lý toàn bộ lịch sử đổi thẻ, mua thẻ, nạp/rút tiền.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" onClick={() => {setSearchText(''); setFilterType('ALL'); setFilterStatus('ALL')}}>Làm mới</Button>
           <Button>Xuất Excel</Button>
        </div>
      </div>

      <Card noPadding>
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4">
           <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm mã GD, User, Serial..." 
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
           </div>
           <Select 
              className="w-48"
              options={[
                {label: 'Tất cả loại hình', value: 'ALL'},
                {label: 'Đổi thẻ cào', value: TransactionType.CARD_EXCHANGE},
                {label: 'Mua mã thẻ', value: TransactionType.CARD_PURCHASE},
                {label: 'Nạp tiền ví', value: TransactionType.WALLET_TOPUP},
                {label: 'Rút tiền', value: TransactionType.WALLET_WITHDRAW},
              ]}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
           />
           <Select 
              className="w-48"
              options={[
                {label: 'Tất cả trạng thái', value: 'ALL'},
                {label: 'Thành công', value: TransactionStatus.SUCCESS},
                {label: 'Đang xử lý', value: TransactionStatus.PROCESSING},
                {label: 'Chờ duyệt', value: TransactionStatus.PENDING},
                {label: 'Thất bại', value: TransactionStatus.FAILED},
                {label: 'Sai mệnh giá', value: TransactionStatus.WRONG_VALUE},
              ]}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
           />
        </div>

        {/* --- MOBILE VIEW (Ultra Compact Trading Card Style) --- */}
        <div className="md:hidden space-y-3 p-3 bg-gray-100">
            {filteredTransactions.map(tx => {
                const style = getTxStyle(tx.type);
                const displayTitle = tx.metadata?.provider || 
                                     (tx.type === TransactionType.WALLET_TOPUP ? 'NẠP BANK' : 
                                      tx.type === TransactionType.WALLET_WITHDRAW ? 'RÚT TIỀN' : 
                                      'KHÁC');

                return (
                <div key={tx.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                    {/* Decorative Color Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg}`}></div>

                    <div className="pl-2">
                        {/* 1. Header: Icon - Name - Status */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${style.bg}`}>
                                    {style.icon}
                                </div>
                                <span className="text-base font-bold text-gray-900 uppercase tracking-tight leading-none">
                                    {displayTitle}
                                </span>
                            </div>
                            <MobileStatusBadge status={tx.status} />
                        </div>

                        {/* 2. Middle Grid (Data Only - No Labels) */}
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2 items-center">
                            {/* User */}
                            <div className="truncate font-medium text-gray-900">
                                {getUserName(tx.userId)}
                            </div>
                            {/* ID */}
                            <div className="truncate font-mono text-gray-500 flex items-center">
                                #{tx.id.slice(-6)} <Copy size={8} className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(tx.id); }}/>
                            </div>
                            {/* Time */}
                            <div className="text-right text-[10px] text-gray-400">
                                {tx.createdAt.split(' ')[1]} {tx.createdAt.split(' ')[0]}
                            </div>
                        </div>

                        {/* 3. Footer: Amount & Action Button */}
                        <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                            <div className={`text-lg font-bold tracking-tighter leading-none ${tx.flow === TransactionFlow.IN ? 'text-green-600' : 'text-gray-900'}`}>
                                {tx.flow === TransactionFlow.IN ? '+' : '-'}{tx.amount.toLocaleString()}
                            </div>
                            
                            <button 
                                className="px-3 py-1 rounded bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-colors"
                                onClick={() => setSelectedTx(tx)}
                            >
                                Chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            )})}
            {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-gray-400 bg-white rounded-lg border border-dashed">Không tìm thấy giao dịch nào</div>
            )}
        </div>

        {/* --- DESKTOP VIEW (Table) --- */}
        <div className="hidden md:block overflow-x-auto">
           <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                 <tr>
                    <th className="px-4 py-3">Giao dịch</th>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3 text-right">Số tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getTransactionColor(tx.type)}`}>
                                {getTransactionIcon(tx.type)}
                             </div>
                             <div>
                                <div className="font-medium text-gray-900 max-w-[200px] truncate" title={tx.shortDescription}>{tx.shortDescription}</div>
                                <div className="text-xs text-gray-500 font-mono">{tx.id}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{getUserName(tx.userId)}</div>
                          <div className="text-xs text-gray-500">{tx.userId}</div>
                       </td>
                       <td className={`px-4 py-3 text-right font-bold ${tx.flow === TransactionFlow.IN ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.flow === TransactionFlow.IN ? '+' : '-'}{tx.amount.toLocaleString()}
                       </td>
                       <td className="px-4 py-3">
                          <TransactionStatusBadge status={tx.status} />
                       </td>
                       <td className="px-4 py-3 text-xs">
                          <div className="font-medium text-gray-900">{tx.createdAt}</div>
                          {tx.updatedAt && tx.updatedAt !== tx.createdAt && tx.status !== 'PENDING' && tx.status !== 'PROCESSING' && (
                              <div className="text-green-600 font-medium mt-1 flex items-center gap-1" title="Thời gian nhận Callback / Hoàn thành">
                                  <CheckCircle2 size={10} />
                                  <span>{tx.updatedAt}</span>
                              </div>
                          )}
                       </td>
                       <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTx(tx)}>
                             <Eye size={16}/>
                          </Button>
                       </td>
                    </tr>
                 ))}
                 {filteredTransactions.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">Không tìm thấy giao dịch nào</td></tr>
                 )}
              </tbody>
           </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
           <span>Hiển thị {filteredTransactions.length} kết quả</span>
           <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>Trước</Button>
              <Button size="sm" variant="outline" disabled>Sau</Button>
           </div>
        </div>
      </Card>

      {/* Transaction Detail Modal */}
      <Modal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        title={`Chi tiết giao dịch #${selectedTx?.id}`}
      >
          {selectedTx && (
              <TransactionDetailContent 
                  transaction={selectedTx} 
                  isAdmin={true} 
              />
          )}
      </Modal>
    </AdminShell>
  );
};

// --- Users Management Page ---
export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    mockApi.getAllUsers().then(setUsers);
  }, []);

  const filteredUsers = users.filter(u => 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search)) &&
    (filterGroup === 'ALL' || u.groupId === filterGroup)
  );

  const handleSaveUser = async () => {
      if (editingUser) {
          await mockApi.updateUser(editingUser.id, editingUser);
          setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
          setEditingUser(null);
          addToast('Cập nhật thành công', 'success');
      }
  };

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
        <div className="flex gap-2 w-full md:w-auto">
            <Input 
                placeholder="Tìm tên, email..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                icon={<Search size={16}/>}
                className="w-full md:w-64"
            />
            <Button size="sm" onClick={() => {}} className="shrink-0"><Plus size={16} className="mr-1"/> Thêm</Button>
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                        <th className="p-4">User Info</th>
                        <th className="p-4">Nhóm (Level)</th>
                        <th className="p-4">Số dư</th>
                        <th className="p-4">Bảo mật</th>
                        <th className="p-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-gray-900">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                            </td>
                            <td className="p-4">
                                <Badge variant="info">{u.groupName || u.groupId}</Badge>
                            </td>
                            <td className="p-4 font-mono font-medium text-gray-700">
                                {u.balance.toLocaleString()}đ
                            </td>
                            <td className="p-4">
                                <div className="flex gap-1">
                                    <span title={u.security?.twoFactorEnabled ? "2FA On" : "2FA Off"}>
                                        {u.security?.twoFactorEnabled ? <Lock size={14} className="text-green-500" /> : <Lock size={14} className="text-gray-300" />}
                                    </span>
                                    <span title={u.security?.hasTransactionPin ? "PIN On" : "PIN Off"}>
                                        {u.security?.hasTransactionPin ? <Shield size={14} className="text-green-500" /> : <Shield size={14} className="text-gray-300" />}
                                    </span>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <Button size="sm" variant="ghost" onClick={() => setEditingUser(u)}><Edit size={16}/></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-400">Không tìm thấy thành viên nào</div>}
      </Card>

      {/* Edit User Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Sửa thông tin thành viên">
          {editingUser && (
              <div className="space-y-4">
                  <Input label="Họ tên" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                  <Input label="Số dư (VND)" type="number" value={editingUser.balance} onChange={e => setEditingUser({...editingUser, balance: Number(e.target.value)})} />
                  <Select 
                    label="Nhóm thành viên" 
                    value={editingUser.groupId}
                    options={[
                        {label: 'Thành viên (Lvl 1)', value: 'g1'},
                        {label: 'Bạc (Lvl 2)', value: 'g2'},
                        {label: 'Vàng (Lvl 3)', value: 'g3'},
                        {label: 'Kim Cương (VIP)', value: 'g4'},
                    ]}
                    onChange={e => setEditingUser({...editingUser, groupId: e.target.value})}
                  />
                  <Button fullWidth onClick={handleSaveUser}>Lưu thay đổi</Button>
              </div>
          )}
      </Modal>
    </AdminShell>
  );
};

// ... (Rest of the file AdminUserGroupsPage, AdminPaymentConfigPage, etc. kept same)
export const AdminUserGroupsPage: React.FC = () => {
    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    const [formData, setFormData] = useState<Partial<UserGroup>>({});

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = () => {
        mockApi.getUserGroups().then(setGroups);
    };

    const handleOpenModal = (group?: UserGroup) => {
        if (group) {
            setEditingGroup(group);
            setFormData(group);
        } else {
            setEditingGroup(null);
            setFormData({
                color: 'bg-gray-100 text-gray-700',
                discountExchange: 0,
                discountShop: 0,
                minSpend: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;
        const groupToSave: UserGroup = {
            id: editingGroup?.id || `g_${Date.now()}`,
            name: formData.name,
            description: formData.description || '',
            color: formData.color || 'bg-gray-100 text-gray-700',
            discountExchange: Number(formData.discountExchange) || 0,
            discountShop: Number(formData.discountShop) || 0,
            minSpend: Number(formData.minSpend) || 0
        };
        await mockApi.saveUserGroup(groupToSave);
        loadGroups();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Bạn có chắc chắn muốn xóa nhóm này?')) {
            await mockApi.deleteUserGroup(id);
            loadGroups();
        }
    };

    return (
        <AdminShell>
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhóm thành viên</h1>
                    <p className="text-sm text-gray-500">Cấu hình cấp độ và ưu đãi cho thành viên.</p>
                </div>
                <Button size="sm" onClick={() => handleOpenModal()}>+ Thêm nhóm mới</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groups.map(group => (
                    <Card key={group.id} className="relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${group.color}`}>
                                    {group.name}
                                </span>
                                {group.minSpend === 0 && <Badge variant="info">Mặc định</Badge>}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(group)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg">
                                    <Edit size={16}/>
                                </button>
                                <button onClick={() => handleDelete(group.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{group.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                             <div>
                                 <span className="text-gray-400 text-xs uppercase block mb-1">Thưởng đổi thẻ</span>
                                 <span className="font-bold text-green-600">+{group.discountExchange}%</span>
                             </div>
                             <div>
                                 <span className="text-gray-400 text-xs uppercase block mb-1">Giảm mua thẻ</span>
                                 <span className="font-bold text-blue-600">-{group.discountShop}%</span>
                             </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGroup ? "Cập nhật nhóm" : "Tạo nhóm mới"}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave}>Lưu thông tin</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Input label="Tên nhóm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <Input label="Mô tả" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                         <Input label="Bonus Đổi thẻ (%)" type="number" step="0.1" value={formData.discountExchange} onChange={e => setFormData({...formData, discountExchange: parseFloat(e.target.value)})}/>
                         <Input label="Giảm giá Mua thẻ (%)" type="number" step="0.1" value={formData.discountShop} onChange={e => setFormData({...formData, discountShop: parseFloat(e.target.value)})}/>
                    </div>
                    <Input label="Hạn mức lên cấp (VNĐ)" type="number" value={formData.minSpend} onChange={e => setFormData({...formData, minSpend: parseInt(e.target.value)})}/>
                </div>
            </Modal>
        </AdminShell>
    )
}

export const AdminPaymentConfigPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [tab, setTab] = useState(0); 
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentGateway>>({});

  useEffect(() => {
    mockApi.getPaymentGateways().then(setGateways);
  }, []);

  const currentList = tab === 0 ? gateways.filter(g => g.flow === PaymentFlow.INBOUND) : gateways.filter(g => g.flow === PaymentFlow.OUTBOUND);

  const handleEdit = (gw: PaymentGateway) => {
    setEditingGateway(gw);
    setFormData(JSON.parse(JSON.stringify(gw))); 
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingGateway && formData) {
      await mockApi.updatePaymentGateway(editingGateway.id, formData);
      mockApi.getPaymentGateways().then(setGateways);
      setIsModalOpen(false);
    }
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch(type) {
      case PaymentMethodType.BANK_TRANSFER: return <Landmark size={20} className="text-blue-600"/>;
      case PaymentMethodType.E_WALLET: return <Zap size={20} className="text-pink-600"/>;
      case PaymentMethodType.CRYPTO: return <Bitcoin size={20} className="text-orange-500"/>;
      default: return <CreditCard size={20}/>;
    }
  };

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình thanh toán</h1>
      <Tabs tabs={['Cổng Nạp (Inbound)', 'Cổng Rút (Outbound)']} activeTab={tab} onChange={setTab} className="mb-6 w-full max-w-md" />

      <div className="grid gap-4">
        {currentList.map(gw => (
          <Card key={gw.id} className={`border-l-4 ${gw.status === 'ACTIVE' ? 'border-l-green-500' : 'border-l-gray-300 opacity-80'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  {getMethodIcon(gw.methodType)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{gw.name}</h3>
                    <Badge variant={gw.status === 'ACTIVE' ? 'success' : 'default'}>{gw.status}</Badge>
                    {gw.autoApprove && <Badge variant="info" className="text-[10px]">AUTO</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{gw.description || 'Không có mô tả'}</p>
                  <div className="flex gap-4 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <div>Min: <strong>{gw.minAmount.toLocaleString()}</strong></div>
                    <div>Max: <strong>{gw.maxAmount.toLocaleString()}</strong></div>
                    <div>Phí: <strong>{gw.feePercent}% + {gw.feeFixed.toLocaleString()}đ</strong></div>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleEdit(gw)}>
                <Settings size={14} className="mr-1"/> Cấu hình
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Cấu hình: ${editingGateway?.name}`} footer={
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave}>Lưu thay đổi</Button></div>
        }>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2"><Settings size={14}/> Thiết lập chung</h4>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Trạng thái" options={[{ label: 'Hoạt động', value: 'ACTIVE' }, { label: 'Bảo trì', value: 'MAINTENANCE' }, { label: 'Tắt', value: 'INACTIVE' }]} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} />
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 mt-6"><span className="text-sm font-medium">Duyệt tự động (Auto)</span><Switch checked={!!formData.autoApprove} onChange={e => setFormData({...formData, autoApprove: e})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="Số tiền tối thiểu" type="number" value={formData.minAmount} onChange={e => setFormData({...formData, minAmount: Number(e.target.value)})} />
              <Input label="Số tiền tối đa" type="number" value={formData.maxAmount} onChange={e => setFormData({...formData, maxAmount: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="Phí giao dịch (%)" type="number" value={formData.feePercent} onChange={e => setFormData({...formData, feePercent: Number(e.target.value)})} />
              <Input label="Phí cố định (VNĐ)" type="number" value={formData.feeFixed} onChange={e => setFormData({...formData, feeFixed: Number(e.target.value)})} />
            </div>
          </div>
          {editingGateway?.configFields && editingGateway.configFields.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2"><Plug size={14}/> Kết nối API</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                {editingGateway.configFields.map(field => (
                  <Input key={field.key} label={field.label} type={field.type === 'password' ? 'password' : 'text'} value={formData.config?.[field.key] || ''} onChange={e => setFormData({...formData, config: { ...formData.config, [field.key]: e.target.value }})} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AdminShell>
  );
};

export const AdminUserApiKeysPage: React.FC = () => {
    const [keys, setKeys] = useState<UserApiKey[]>([]);
    const [activeTab, setActiveTab] = useState(0); // 0: Pending, 1: Active
    const { addToast } = useToast();

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = () => {
        mockApi.getAdminUserApiKeys().then(setKeys);
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'LOCK' | 'DELETE') => {
        if (action === 'DELETE' && !confirm('Xóa API Key này? Hành động không thể hoàn tác.')) return;
        
        if (action === 'DELETE') {
            await mockApi.deleteUserApiKey(id);
        } else {
            const status = action === 'APPROVE' ? 'ACTIVE' : 'LOCKED';
            await mockApi.updateUserApiKeyStatus(id, status);
        }
        
        loadKeys();
        addToast('Thao tác thành công', 'success');
    };

    const filteredKeys = activeTab === 0 
        ? keys.filter(k => k.status === 'PENDING')
        : keys.filter(k => k.status !== 'PENDING');

    return (
        <AdminShell>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Duyệt tích hợp API</h1>
            <Tabs tabs={[`Chờ duyệt (${keys.filter(k => k.status === 'PENDING').length})`, 'Đã duyệt / Khóa']} activeTab={activeTab} onChange={setActiveTab} className="mb-6 w-full max-w-md"/>
            
            <div className="grid gap-4">
                {filteredKeys.map(key => (
                    <Card key={key.id} className="relative">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900">{key.name}</h3>
                                    <Badge variant={key.status === 'ACTIVE' ? 'success' : key.status === 'PENDING' ? 'warning' : 'error'}>{key.status}</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    User: <span className="font-semibold text-primary-700">{key.userName}</span> • ID: {key.userId}
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {key.createdAt}</span>
                                    <span className="flex items-center gap-1"><Globe size={12}/> {key.callbackUrl || 'No Callback'}</span>
                                    <span className="flex items-center gap-1"><Shield size={12}/> {key.ipWhitelist || 'Any IP'}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 self-end md:self-center">
                                {key.status === 'PENDING' && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(key.id, 'APPROVE')}>
                                        <CheckCircle size={16} className="mr-1"/> Duyệt
                                    </Button>
                                )}
                                {key.status === 'ACTIVE' && (
                                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-200" onClick={() => handleAction(key.id, 'LOCK')}>
                                        <Lock size={16} className="mr-1"/> Khóa
                                    </Button>
                                )}
                                {key.status === 'LOCKED' && (
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleAction(key.id, 'APPROVE')}>
                                        <Unlock size={16} className="mr-1"/> Mở khóa
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleAction(key.id, 'DELETE')}>
                                    <Trash2 size={16}/>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {filteredKeys.length === 0 && <div className="text-center py-8 text-gray-400">Không có dữ liệu</div>}
            </div>
        </AdminShell>
    );
};

export const AdminApiConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConn, setEditingConn] = useState<ApiConnection | null>(null);
  const [formData, setFormData] = useState<Partial<ApiConnection>>({});
  const { addToast } = useToast();

  useEffect(() => { 
      mockApi.getApiConnections().then(setConnections); 
  }, []);

  const handleOpenModal = (conn?: ApiConnection) => {
      if (conn) {
          setEditingConn(conn);
          setFormData(conn);
      } else {
          setEditingConn(null);
          setFormData({
              type: ApiConnectionType.EXCHANGE,
              status: 'ACTIVE',
              priority: 1
          });
      }
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!formData.name || !formData.code || !formData.baseUrl) return addToast('Vui lòng điền đủ thông tin', 'error');
      
      const newConn = {
          ...formData,
          id: editingConn?.id || undefined, // undefined to let API generate
      } as ApiConnection;

      await mockApi.saveApiConnection(newConn);
      
      const updated = await mockApi.getApiConnections();
      setConnections(updated);
      setIsModalOpen(false);
      addToast('Lưu kết nối thành công', 'success');
  };

  const handleDelete = async (id: string) => {
      if (confirm('Xóa kết nối này?')) {
          await mockApi.deleteApiConnection(id);
          const updated = await mockApi.getApiConnections();
          setConnections(updated);
          addToast('Đã xóa', 'success');
      }
  };

  return (
    <AdminShell>
       <div className="flex justify-between items-center mb-6">
           <div>
               <h1 className="text-2xl font-bold text-gray-900">Kết nối Nhà cung cấp (NCC)</h1>
               <p className="text-sm text-gray-500">Cấu hình API đổi thẻ & kho thẻ</p>
           </div>
           <Button size="sm" onClick={() => handleOpenModal()}>+ Thêm kết nối</Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {connections.map(conn => (
           <Card key={conn.id} className={`relative border-l-4 ${conn.status === 'ACTIVE' ? 'border-l-green-500' : 'border-l-gray-300'}`}>
              <div className="absolute top-4 right-4 flex gap-1">
                  <button onClick={() => handleOpenModal(conn)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(conn.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><Trash2 size={16}/></button>
              </div>
              
              <div className="mb-4">
                  <Badge variant="default" className="mb-2">{conn.type}</Badge>
                  <h3 className="font-bold text-lg text-gray-900">{conn.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{conn.baseUrl}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between">
                      <span className="text-gray-500">Partner ID:</span>
                      <span className="font-medium">{conn.username}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span className="font-medium">{conn.priority}</span>
                  </div>
                  {conn.balance !== undefined && (
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                          <span className="text-gray-500">Số dư NCC:</span>
                          <span className="font-bold text-green-700">{conn.balance.toLocaleString()}đ</span>
                      </div>
                  )}
              </div>
              
              <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => addToast('Đang kiểm tra kết nối...', 'info')}>
                      <Activity size={14} className="mr-1"/> Test Ping
                  </Button>
                  {conn.type === ApiConnectionType.EXCHANGE && (
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-8" title="Copy Webhook URL" onClick={() => {navigator.clipboard.writeText(conn.webhookUrl || ''); addToast('Copied Webhook URL', 'success')}}>
                          <Link2 size={14} className="mr-1"/> Webhook
                      </Button>
                  )}
              </div>
           </Card>
         ))}
         
         {connections.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                 Chưa có kết nối nào. Bấm "Thêm kết nối" để bắt đầu.
             </div>
         )}
       </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingConn ? "Cập nhật kết nối" : "Thêm nhà cung cấp mới"}>
           <div className="space-y-4">
               <Select 
                   label="Loại kết nối"
                   options={[
                       {label: 'Gạch thẻ (Exchange)', value: ApiConnectionType.EXCHANGE},
                       {label: 'Kho thẻ (Store/Shop)', value: ApiConnectionType.STORE},
                       {label: 'SMS Brandname', value: ApiConnectionType.SMS_GATEWAY},
                   ]}
                   value={formData.type}
                   onChange={e => setFormData({...formData, type: e.target.value as any})}
               />
               <Input label="Tên gợi nhớ" placeholder="VD: TichHop247, Banthe247..." value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
               <Input label="Mã hệ thống (Code)" placeholder="PROVIDER_CODE" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
               <Input label="Base URL (API Endpoint)" placeholder="https://api.domain.com" value={formData.baseUrl || ''} onChange={e => setFormData({...formData, baseUrl: e.target.value})} />
               
               <div className="grid grid-cols-2 gap-4">
                   <Input label="Partner ID / Username" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                   <Input label="Độ ưu tiên (1 = Cao nhất)" type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} />
               </div>

               <div className="border-t border-gray-100 pt-4">
                   <h4 className="text-sm font-bold text-gray-900 mb-3">Thông tin bảo mật (Credentials)</h4>
                   <div className="space-y-3">
                       <Input label="API Key" type="password" value={formData.apiKey || ''} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
                       <Input label="Secret Key (Sign)" type="password" value={formData.secretKey || ''} onChange={e => setFormData({...formData, secretKey: e.target.value})} />
                   </div>
               </div>

               <div className="flex items-center justify-between pt-2">
                   <span className="text-sm font-medium">Trạng thái hoạt động</span>
                   <Switch checked={formData.status === 'ACTIVE'} onChange={e => setFormData({...formData, status: e ? 'ACTIVE' : 'INACTIVE'})} />
               </div>

               <Button fullWidth onClick={handleSave} className="mt-4">Lưu cấu hình</Button>
           </div>
       </Modal>
    </AdminShell>
  );
};

export const AdminProductsPage: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [inventory, setInventory] = useState<CardCode[]>([]);
    const [providers, setProviders] = useState<CardProvider[]>([]);
    const [filterProvider, setFilterProvider] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [visibleCodeId, setVisibleCodeId] = useState<string | null>(null);
    
    // Import Modal
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importProvider, setImportProvider] = useState('');
    const [importValue, setImportValue] = useState(0);
    const [importData, setImportData] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        mockApi.getCardInventory().then(setInventory);
        mockApi.getProviders().then(setProviders);
    }, []);

    const filteredInventory = inventory.filter(item => 
        (filterProvider === 'ALL' || item.providerCode === filterProvider) &&
        (filterStatus === 'ALL' || item.status === filterStatus)
    );

    const stats = useMemo(() => {
        return inventory.reduce((acc, item) => {
            if (item.status === 'AVAILABLE') {
                acc.count++;
                acc.value += item.value;
            }
            return acc;
        }, { count: 0, value: 0 });
    }, [inventory]);

    const handleImport = async () => {
        if (!importProvider || !importValue || !importData.trim()) return;
        setIsProcessing(true);
        try {
            // Parse data
            const lines = importData.split('\n').filter(l => l.trim());
            const codes = lines.map(line => {
                const parts = line.split(/[\s|,-]+/);
                if (parts.length >= 2) return { code: parts[0], serial: parts[1] };
                return null;
            }).filter(c => c !== null) as {code: string, serial: string}[];

            if (codes.length === 0) throw new Error('Không tìm thấy mã thẻ hợp lệ');

            await mockApi.importCardCodes(importProvider, importValue, codes);
            addToast(`Đã nhập ${codes.length} thẻ thành công`, 'success');
            
            // Refresh
            const newInv = await mockApi.getCardInventory();
            setInventory(newInv);
            setIsImportModalOpen(false);
            setImportData('');
        } catch (e) {
            addToast('Lỗi nhập thẻ', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Xóa mã thẻ này khỏi kho?')) {
            await mockApi.deleteCardCode(id);
            setInventory(prev => prev.filter(c => c.id !== id));
            addToast('Đã xóa thẻ', 'success');
        }
    };

    return (
        <AdminShell>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý kho thẻ</h1>
                <Button size="sm" onClick={() => setIsImportModalOpen(true)}>
                    <Plus size={16} className="mr-1"/> Nhập kho
                </Button>
            </div>

            {/* Mini Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-100 flex items-center p-4">
                    <div className="p-3 bg-white rounded-lg text-blue-600 mr-4 shadow-sm"><Package size={24}/></div>
                    <div>
                        <p className="text-xs font-bold text-blue-800 uppercase">Tổng thẻ tồn</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.count.toLocaleString()}</h3>
                    </div>
                </Card>
                <Card className="bg-green-50 border-green-100 flex items-center p-4">
                    <div className="p-3 bg-white rounded-lg text-green-600 mr-4 shadow-sm"><DollarSign size={24}/></div>
                    <div>
                        <p className="text-xs font-bold text-green-800 uppercase">Giá trị tồn kho</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.value.toLocaleString()}đ</h3>
                    </div>
                </Card>
            </div>

            <Card noPadding>
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 flex gap-4 flex-wrap">
                    <Select 
                        className="w-48"
                        options={[{label: 'Tất cả nhà mạng', value: 'ALL'}, ...providers.map(p => ({label: p.name, value: p.code}))]}
                        value={filterProvider}
                        onChange={e => setFilterProvider(e.target.value)}
                    />
                    <Select 
                        className="w-48"
                        options={[
                            {label: 'Tất cả trạng thái', value: 'ALL'}, 
                            {label: 'Sẵn sàng (Available)', value: 'AVAILABLE'},
                            {label: 'Đã bán (Sold)', value: 'SOLD'}
                        ]}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4">Thông tin thẻ</th>
                                <th className="p-4">Chi tiết mã (Serial / Code)</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4">Ngày nhập</th>
                                <th className="p-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{item.providerCode}</div>
                                        <div className="text-primary-600 font-semibold">{item.value.toLocaleString()}đ</div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        <div className="text-gray-500">S: <span className="text-gray-900">{item.serial}</span></div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-gray-500">C:</span>
                                            <span className={visibleCodeId === item.id ? "text-red-600 font-bold" : "text-gray-400 blur-sm select-none"}>
                                                {item.code}
                                            </span>
                                            <button onClick={() => setVisibleCodeId(visibleCodeId === item.id ? null : item.id)} className="text-gray-400 hover:text-gray-600">
                                                {visibleCodeId === item.id ? <EyeOff size={12}/> : <Eye size={12}/>}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={item.status === 'AVAILABLE' ? 'success' : 'default'}>{item.status}</Badge>
                                        {item.soldAt && <div className="text-[10px] text-gray-400 mt-1">Bán: {item.soldAt.split(' ')[1]}</div>}
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs">{item.createdAt}</td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                            <Trash2 size={16}/>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredInventory.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Không tìm thấy thẻ nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Nhập kho thẻ cào">
                <div className="space-y-4">
                    <Select 
                        label="Nhà mạng"
                        options={providers.map(p => ({label: p.name, value: p.code}))}
                        value={importProvider}
                        onChange={e => setImportProvider(e.target.value)}
                    />
                    <Input 
                        label="Mệnh giá"
                        type="number"
                        value={importValue}
                        onChange={e => setImportValue(Number(e.target.value))}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh sách thẻ (Mã | Seri)</label>
                        <textarea 
                            className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            placeholder="123456 | 998877&#10;234567 - 887766"
                            value={importData}
                            onChange={e => setImportData(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Hỗ trợ phân cách bằng dấu gạch đứng (|), gạch ngang (-), hoặc khoảng trắng.</p>
                    </div>
                    <Button fullWidth onClick={handleImport} isLoading={isProcessing} disabled={!importProvider || !importValue || !importData}>
                        Tiến hành nhập
                    </Button>
                </div>
            </Modal>
        </AdminShell>
    );
};

// --- Route Configuration Page (NEW) ---
export const AdminRouteConfigPage: React.FC = () => {
  const [providers, setProviders] = useState<CardProvider[]>([]);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
     Promise.all([
         mockApi.getProviders(), 
         mockApi.getProducts(),
         mockApi.getApiConnections()
     ]).then(([p, prod, conn]) => {
      setProviders(p);
      setProducts(prod);
      setConnections(conn);
    });
  }, []);

  const handleUpdate = async (updates: Partial<CardProduct>[]) => {
     await mockApi.updateProducts(updates);
     // Refresh local state to ensure matrix updates
     const newProds = await mockApi.getProducts();
     setProducts(newProds);
     addToast('Đã lưu cấu hình phân luồng', 'success');
  };

  return (
    <AdminShell>
      <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cấu hình phân luồng thẻ (Routing)</h1>
          <p className="text-sm text-gray-500">Chỉ định nhà cung cấp xử lý cho từng loại thẻ và mệnh giá.</p>
      </div>
      
      {/* Exchange Routing (Inbound) */}
      <RouteMatrix 
          title="Luồng Gạch thẻ (Inbound)" 
          type="EXCHANGE" 
          providers={providers} 
          products={products} 
          connections={connections}
          onUpdate={handleUpdate} 
      />

      {/* Store Routing (Outbound) */}
      <RouteMatrix 
          title="Luồng Mua thẻ (Outbound)" 
          type="SHOP" 
          providers={providers} 
          products={products} 
          connections={connections}
          onUpdate={handleUpdate} 
      />
    </AdminShell>
  );
};

// --- Exports for placeholders ---
export const AdminExchangeOrdersPage = () => <AdminGenericList title="Đơn đổi thẻ" />; // Kept as placeholder but not used
export const AdminWithdrawalsPage = () => <AdminGenericList title="Yêu cầu rút tiền" />;
export const AdminTicketInbox = () => <AdminGenericList title="Hộp thư hỗ trợ" />;
export const AdminSecurityPage = () => <AdminGenericList title="Bảo mật hệ thống" />;
export const AdminBroadcastPage = () => <AdminGenericList title="Gửi thông báo (Broadcast)" />;

export const AdminFeeConfigPage: React.FC = () => {
  const [providers, setProviders] = useState<CardProvider[]>([]);
  const [products, setProducts] = useState<CardProduct[]>([]);

  useEffect(() => {
     Promise.all([mockApi.getProviders(), mockApi.getProducts()]).then(([p, prod]) => {
      setProviders(p);
      setProducts(prod);
    });
  }, []);

  const handleUpdate = async (updates: Partial<CardProduct>[]) => {
     await mockApi.updateProducts(updates);
     alert('Đã cập nhật cấu hình thành công!');
  };

  return (
    <AdminShell>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình bảng phí</h1></div>
      <PricingMatrix title="1. Cấu hình phí đổi thẻ" type="EXCHANGE" providers={providers} products={products} isEditable onUpdate={handleUpdate} />
      <PricingMatrix title="2. Cấu hình giá bán" type="SHOP" providers={providers} products={products} isEditable onUpdate={handleUpdate} />
    </AdminShell>
  );
};

// Added missing exports
export const AdminSupportInbox = () => <AdminGenericList title="Hộp thư hỗ trợ" />;
export const AdminSupportSettings = () => <AdminGenericList title="Cấu hình hỗ trợ" />;
export const AdminFaqManagement = () => <AdminGenericList title="Quản lý FAQ" />;