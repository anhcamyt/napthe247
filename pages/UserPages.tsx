import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/Layouts';
import { Card, Button, Badge, ListItem, Tabs, Input, Select, Modal, useToast } from '../components/UIComponents';
import { ArrowUpRight, ArrowDownLeft, Clock, Search, History, AlertCircle, ShoppingBag, Check, Copy, FileText, Percent, Code2, Globe, Shield, Terminal, Wallet as WalletIcon, CreditCard, ChevronRight, Info, Key, Plus, Lock, Eye, EyeOff, Edit, Trash2, Landmark } from 'lucide-react';
import { mockApi } from '../services/api';
import { Transaction, User, CardProvider, CardProduct, TransactionType, TransactionStatus, UserApiKey, PaymentGateway, PaymentFlow, TransactionFlow, UserBankAccount } from '../types';
import { useNavigate } from 'react-router-dom';
import { PricingMatrix } from '../components/PricingUI';
import { TransactionStatusBadge } from '../components/TransactionUI';

// --- Dashboard ---
export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getUser().then(setUser);
    mockApi.getTransactions().then(tx => setRecentTx(tx.slice(0, 5)));
  }, []);

  return (
    <AppShell title="Trang chủ">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-primary-200 text-sm font-medium">Tổng tài sản</p>
            {user?.isPro && <span className="bg-yellow-500/20 text-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-500/30">MEMBER PRO</span>}
          </div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">
            {user ? user.balance.toLocaleString('vi-VN') : '...'} <span className="text-xl font-normal opacity-80">đ</span>
          </h2>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm shadow-none" onClick={() => navigate('/app/wallet')}>
              <ArrowDownLeft className="w-4 h-4 mr-1.5" /> Nạp tiền
            </Button>
            <Button variant="secondary" size="sm" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm shadow-none" onClick={() => navigate('/app/wallet')}>
              <ArrowUpRight className="w-4 h-4 mr-1.5" /> Rút tiền
            </Button>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-primary-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: History, label: 'Lịch sử', path: '/app/transactions' },
          { icon: ShoppingBag, label: 'Mua thẻ', path: '/app/shop' },
          { icon: Percent, label: 'Bảng phí', path: '/app/pricing' },
          { icon: Code2, label: 'Tích hợp API', path: '/app/developer' },
        ].map((item, idx) => (
          <button key={idx} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-primary-700 group-active:scale-95 transition-transform">
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3 mt-2">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Giao dịch gần đây</h3>
          <button onClick={() => navigate('/app/transactions')} className="text-xs text-primary-600 font-semibold hover:underline">Xem tất cả</button>
        </div>
        <div className="space-y-3">
          {recentTx.map((tx) => (
            <Card key={tx.id} noPadding className="active:bg-gray-50 transition-colors cursor-pointer">
              <ListItem
                onClick={() => navigate(`/app/transaction/${tx.id}`)}
                icon={
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                     tx.type === TransactionType.CARD_EXCHANGE ? 'bg-blue-50 text-blue-600' : 
                     tx.type === TransactionType.WALLET_TOPUP ? 'bg-green-50 text-green-600' : 
                     tx.type === TransactionType.CARD_PURCHASE ? 'bg-purple-50 text-purple-600' :
                     'bg-orange-50 text-orange-600'
                   }`}>
                      {tx.type === TransactionType.CARD_EXCHANGE ? <History size={18}/> : 
                       tx.type === TransactionType.WALLET_TOPUP ? <ArrowDownLeft size={18}/> : 
                       tx.type === TransactionType.CARD_PURCHASE ? <ShoppingBag size={18}/> :
                       <ArrowUpRight size={18}/>}
                   </div>
                }
                title={tx.shortDescription}
                subtitle={tx.createdAt}
                rightElement={
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      tx.type === TransactionType.WALLET_TOPUP || (tx.type === TransactionType.CARD_EXCHANGE && tx.status === TransactionStatus.SUCCESS) ? 'text-green-600' : 'text-gray-900'
                    }`}>
                       {tx.flow === TransactionFlow.OUT ? '-' : '+'}{tx.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      tx.status === TransactionStatus.SUCCESS ? 'bg-green-100 text-green-700' : 
                      tx.status === TransactionStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status === 'SUCCESS' ? 'Thành công' : 
                       tx.status === 'PENDING' ? 'Chờ xử lý' : 
                       tx.status === 'PROCESSING' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

// --- Wallet ---
export const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  // Deposit State
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [depositAmount, setDepositAmount] = useState(50000);
  const [qrData, setQrData] = useState<{qrUrl: string, content: string} | null>(null);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [userBanks, setUserBanks] = useState<UserBankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    mockApi.getUser().then(u => setBalance(u.balance));
    mockApi.getPaymentGateways().then(setGateways);
    mockApi.getUserBankAccounts().then(setUserBanks);
  }, []);

  const handleDeposit = async () => {
    if (!selectedGateway) return;
    setQrData(null);
    const res = await mockApi.createDepositRequest(selectedGateway.id, depositAmount);
    setQrData(res);
  };

  const handleWithdraw = async () => {
    if (withdrawAmount > balance) {
        addToast('Số dư không đủ', 'error');
        return;
    }
    if (withdrawAmount < 50000) {
        addToast('Tối thiểu rút 50,000đ', 'error');
        return;
    }
    if (!selectedBankId) {
        addToast('Vui lòng chọn ngân hàng nhận tiền', 'error');
        return;
    }

    const bank = userBanks.find(b => b.id === selectedBankId);
    if (!bank) return;

    // Pass JSON string or object depending on API contract. Using string for now based on previous impl.
    const bankInfoString = JSON.stringify(bank);
    await mockApi.requestWithdraw(withdrawAmount, bankInfoString);
    addToast('Yêu cầu rút tiền đã được gửi', 'success');
    setBalance(prev => prev - withdrawAmount);
    setIsWithdrawModalOpen(false);
  };

  return (
    <AppShell title="Ví của tôi">
      <div className="text-center py-8 bg-white rounded-xl shadow-card border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
         <p className="text-gray-500 mb-1 text-sm font-medium">Tổng tài sản hiện có</p>
         <h1 className="text-4xl font-bold text-primary-900 mb-8">{balance.toLocaleString()}đ</h1>
         <div className="flex justify-center gap-4 px-6">
            <Button className="flex-1 shadow-lg shadow-primary-500/20" onClick={() => setIsDepositModalOpen(true)}>Nạp tiền</Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsWithdrawModalOpen(true)}>Rút tiền</Button>
         </div>
      </div>

      <h3 className="font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
         <span className="w-1 h-5 bg-primary-600 rounded-full"></span>
         Lịch sử biến động
      </h3>
      <div className="space-y-3">
         {/* Could load real transactions here */}
         <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed text-sm">
            Xem chi tiết trong mục Lịch sử
         </div>
      </div>

      {/* --- Deposit Modal --- */}
      <Modal 
        isOpen={isDepositModalOpen} 
        onClose={() => { setIsDepositModalOpen(false); setQrData(null); setSelectedGateway(null); }} 
        title="Nạp tiền vào ví"
      >
         {!qrData ? (
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {gateways.filter(g => g.flow === PaymentFlow.INBOUND && g.status === 'ACTIVE').map(g => (
                        <div 
                            key={g.id} 
                            onClick={() => setSelectedGateway(g)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedGateway?.id === g.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="font-bold text-sm text-gray-900">{g.name}</div>
                            <div className="text-xs text-gray-500 mt-1">Tối thiểu: {g.minAmount.toLocaleString()}đ</div>
                        </div>
                    ))}
                </div>
                
                {selectedGateway && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <Input 
                            label="Số tiền muốn nạp" 
                            type="number"
                            value={depositAmount} 
                            onChange={e => setDepositAmount(Number(e.target.value))}
                        />
                        <Button fullWidth onClick={handleDeposit} className="mt-4">Tạo mã QR</Button>
                    </div>
                )}
             </div>
         ) : (
             <div className="text-center space-y-4 animate-in zoom-in duration-300">
                 <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-sm text-green-800 font-medium mb-2">Quét mã để thanh toán</p>
                    <img src={qrData.qrUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg shadow-sm" />
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Nội dung chuyển khoản (Bắt buộc)</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold text-primary-700">{qrData.content}</code>
                        <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(qrData.content)}><Copy size={16}/></Button>
                    </div>
                 </div>
                 <Button variant="outline" fullWidth onClick={() => { setIsDepositModalOpen(false); setQrData(null); }}>Đóng</Button>
             </div>
         )}
      </Modal>

      {/* --- Withdraw Modal --- */}
      <Modal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} title="Rút tiền về ngân hàng">
         <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Số dư khả dụng: <strong>{balance.toLocaleString()}đ</strong></p>
            </div>
            
            <Input 
                label="Số tiền rút" 
                type="number" 
                placeholder="Tối thiểu 50,000"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(Number(e.target.value))}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngân hàng nhận tiền</label>
                {userBanks.length > 0 ? (
                    <div className="space-y-2">
                        {userBanks.map(bank => (
                            <div 
                                key={bank.id}
                                onClick={() => setSelectedBankId(bank.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    selectedBankId === bank.id 
                                    ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-primary-700">
                                    <Landmark size={20}/>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-gray-900">{bank.bankShortName || bank.bankName}</div>
                                    <div className="text-xs text-gray-500 font-mono">{bank.accountNumber}</div>
                                </div>
                                {selectedBankId === bank.id && <div className="w-4 h-4 bg-primary-600 rounded-full"></div>}
                            </div>
                        ))}
                        <Button 
                            size="sm" variant="ghost" 
                            className="w-full text-gray-500" 
                            onClick={() => {
                                setIsWithdrawModalOpen(false);
                                navigate('/app/profile'); // Redirect to profile to add bank
                            }}
                        >
                            <Plus size={16} className="mr-1"/> Thêm tài khoản mới
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-sm text-gray-500 mb-2">Bạn chưa liên kết tài khoản ngân hàng</p>
                        <Button size="sm" variant="outline" onClick={() => {
                            setIsWithdrawModalOpen(false);
                            navigate('/app/profile');
                        }}>
                            Thêm tài khoản ngay
                        </Button>
                    </div>
                )}
            </div>

            <Button fullWidth onClick={handleWithdraw} disabled={withdrawAmount <= 0 || !selectedBankId}>Gửi yêu cầu</Button>
         </div>
      </Modal>
    </AppShell>
  );
};

export const Exchange: React.FC = () => {
  const [tab, setTab] = useState(0); 
  const [providers, setProviders] = useState<CardProvider[]>([]);
  const [products, setProducts] = useState<CardProduct[]>([]);
  
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProductValue, setSelectedProductValue] = useState<number>(0);
  
  const [code, setCode] = useState('');
  const [serial, setSerial] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]); // New state for session history

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([mockApi.getProviders(), mockApi.getProducts()]).then(([p, prod]) => {
      const telcos = p.filter(x => x.type === 'TELCO');
      setProviders(telcos); 
      setProducts(prod);
      if (telcos.length > 0) setSelectedProvider(telcos[0].code);
    });
  }, []);

  // Polling to auto-refresh status
  useEffect(() => {
    const timer = setInterval(async () => {
        // Check if there are any pending/processing transactions in view
        const activeTxs = recentTxs.filter(tx => 
            tx.status === TransactionStatus.PENDING || 
            tx.status === TransactionStatus.PROCESSING
        );

        if (activeTxs.length === 0) return;

        // Fetch latest status for these transactions
        const updates = await Promise.all(activeTxs.map(tx => mockApi.getTransactionDetail(tx.id)));
        
        setRecentTxs(prev => prev.map(tx => {
            const found = updates.find(u => u?.id === tx.id);
            if (found && found.status !== tx.status) {
                // If status changed to success/wrong_value, we might want to update user balance too (optional here)
                return found;
            }
            return tx;
        }));
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(timer);
  }, [recentTxs]);

  const currentProducts = products.filter(p => p.providerCode === selectedProvider);
  const currentRate = currentProducts.find(p => p.value === selectedProductValue)?.exchangeRate || 0;

  // Bulk Parsing Logic
  const parsedCards = React.useMemo(() => {
      if (tab === 0) return code && serial ? [{code, serial}] : [];
      return bulkData.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Try to split by common separators
            const parts = line.split(/[\s|,-]+/);
            if (parts.length >= 2) return { code: parts[0], serial: parts[1] };
            return null;
        })
        .filter(item => item !== null) as {code: string, serial: string}[];
  }, [tab, code, serial, bulkData]);

  const count = parsedCards.length;
  const receiveAmount = (selectedProductValue * (currentRate / 100)) * count;

  const handleSubmit = async () => {
      setIsProcessing(true);
      try {
          const newTxs: Transaction[] = [];
          for (const card of parsedCards) {
              const tx = await mockApi.exchangeCard(selectedProvider, card.code, card.serial, selectedProductValue);
              newTxs.push(tx);
          }
          addToast(`Đã gửi ${count} thẻ lên hệ thống`, 'success');
          
          // Add new transactions to the top of the local list
          setRecentTxs(prev => [...newTxs, ...prev]);

          // Reset form
          setCode(''); setSerial(''); setBulkData('');
          
      } catch (e) {
          addToast('Có lỗi xảy ra', 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <AppShell title="Đổi thẻ cào">
      <Card className="mb-6">
        <Tabs tabs={['Nhập lẻ', 'Nhập nhiều (Bulk)']} activeTab={tab} onChange={setTab} className="mb-4" />
        
        <div className="space-y-4">
          <Select 
            label="Chọn nhà mạng"
            options={providers.map(p => ({ label: p.name, value: p.code }))}
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          />

          <Select 
              label="Chọn mệnh giá"
              options={[
                { label: 'Chọn mệnh giá', value: 0 },
                ...currentProducts.map(p => ({
                  label: `${p.value.toLocaleString()}đ - Nhận ${p.exchangeRate}%`,
                  value: p.value
                }))
              ]}
              value={selectedProductValue}
              onChange={(e) => setSelectedProductValue(Number(e.target.value))}
            />

          {tab === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <Input label="Mã thẻ" placeholder="Nhập mã thẻ" value={code} onChange={(e) => setCode(e.target.value)} />
              <Input label="Số seri" placeholder="Nhập số seri" value={serial} onChange={(e) => setSerial(e.target.value)} />
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nhập danh sách ({count} thẻ hợp lệ)
              </label>
              <textarea 
                className="w-full min-h-[140px] rounded-lg border border-gray-200 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={`Mã thẻ 1 | Seri 1\nMã thẻ 2 - Seri 2`}
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
            </div>
          )}

          {selectedProductValue > 0 && count > 0 && (
            <div className="bg-green-50 rounded-lg p-3 text-sm border border-green-100 flex justify-between items-center">
               <span className="text-gray-600">Thực nhận dự kiến:</span>
               <span className="font-bold text-green-700 text-xl">{receiveAmount.toLocaleString()}đ</span>
            </div>
          )}
          
          <Button 
            fullWidth size="lg" className="mt-2 font-bold shadow-md" 
            disabled={!selectedProvider || !selectedProductValue || count === 0}
            isLoading={isProcessing}
            onClick={handleSubmit}
          >
            GỬI THẺ ({count})
          </Button>
        </div>
      </Card>
      
      {/* --- Recently Submitted Section --- */}
      {recentTxs.length > 0 ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500 mb-6">
            <div className="flex justify-between items-center mb-3 px-1">
               <h3 className="font-bold text-gray-900 text-sm uppercase flex items-center gap-2">
                  <Clock size={16} className="text-primary-600"/>
                  Thẻ vừa gửi ({recentTxs.length})
               </h3>
               <button onClick={() => navigate('/app/transactions')} className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
                  Xem lịch sử <ArrowUpRight size={12}/>
               </button>
            </div>
            <div className="space-y-3 mb-4">
               {recentTxs.map(tx => (
                  <div key={tx.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-500">
                            {tx.metadata?.provider === 'VIETTEL' ? <span className="font-bold text-[10px]">VT</span> : 
                             tx.metadata?.provider === 'VINAPHONE' ? <span className="font-bold text-[10px]">VN</span> :
                             <CreditCard size={16}/>}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                {tx.metadata?.provider} {tx.metadata?.declaredValue?.toLocaleString()}đ
                            </div>
                            <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                               <span className="font-mono">{tx.metadata?.serial}</span>
                               <span className="text-gray-300">|</span>
                               <span>{tx.createdAt.split(' ')[1]}</span>
                            </div>
                        </div>
                     </div>
                     <TransactionStatusBadge status={tx.status} />
                  </div>
               ))}
            </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 border border-blue-100 mb-6 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
            <strong>Lưu ý:</strong> Sai mệnh giá bị trừ 50% thực nhận. Cố tình sai nhiều lần sẽ khóa tài khoản.
            </div>
        </div>
      )}
    </AppShell>
  );
};

// --- Shop ---
export const Shop: React.FC = () => {
  const [providers, setProviders] = useState<CardProvider[]>([]);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<CardProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Success Modal State
  const [purchasedCards, setPurchasedCards] = useState<any[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([mockApi.getProviders(), mockApi.getProducts()]).then(([p, prod]) => {
      setProviders(p); 
      setProducts(prod);
      if (p.length > 0) setSelectedProvider(p[0].code);
    });
  }, []);

  const handleBuy = async () => {
      if (!selectedProduct) return;
      setIsProcessing(true);
      try {
          const res = await mockApi.buyCard(selectedProduct.providerCode, selectedProduct.value, quantity);
          setPurchasedCards(res.cards);
          addToast('Mua thẻ thành công!', 'success');
      } catch (e: any) {
          addToast(e.message || 'Lỗi mua thẻ', 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  const filteredProducts = products.filter(p => p.providerCode === selectedProvider);
  const totalAmount = selectedProduct ? (selectedProduct.value * (1 - selectedProduct.buyDiscount/100)) * quantity : 0;

  return (
    <AppShell title="Mua mã thẻ">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block">1. Chọn loại thẻ</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProvider(p.code); setSelectedProduct(null); }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-20 ${
                    selectedProvider === p.code 
                      ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600' 
                      : 'border-gray-200 bg-white hover:border-primary-200'
                  }`}
                >
                  <span className="text-xs font-bold text-center break-words w-full">{p.name}</span>
                  {selectedProvider === p.code && (
                    <div className="absolute top-1 right-1 bg-primary-600 text-white p-0.5 rounded-full"><Check size={10} /></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedProvider && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-gray-900 mb-3 block">2. Chọn mệnh giá</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      selectedProduct?.id === prod.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900">{prod.value.toLocaleString()}đ</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 line-through">{prod.value.toLocaleString()}</span>
                      <span className="text-xs font-bold text-red-500">-{prod.buyDiscount}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedProduct && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">Số lượng</label>
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-gray-600 hover:bg-gray-100">-</button>
                    <span className="px-3 py-1 font-medium min-w-[30px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Đơn giá:</span>
                      <span>{(selectedProduct.value * (1 - selectedProduct.buyDiscount/100)).toLocaleString()}đ</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Số lượng:</span>
                      <span>x{quantity}</span>
                   </div>
                   <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Tổng thanh toán:</span>
                      <span className="font-bold text-xl text-primary-700">{totalAmount.toLocaleString()}đ</span>
                   </div>
                </div>

                <Button fullWidth size="lg" className="font-bold" isLoading={isProcessing} onClick={handleBuy}>
                   THANH TOÁN NGAY
                </Button>
             </div>
          )}
        </div>
      </Card>

      {/* Result Modal */}
      <Modal isOpen={!!purchasedCards} onClose={() => setPurchasedCards(null)} title="Giao dịch thành công">
          <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                      <Check size={32} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Mua thẻ thành công!</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {purchasedCards?.map((card, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Thẻ {selectedProduct?.providerCode} {card.value.toLocaleString()}</span>
                              <span>HSD: {card.expiry}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-dashed border-gray-300 flex justify-between items-center mb-1">
                              <span className="font-mono font-bold text-gray-800">Mã: {card.code}</span>
                              <Copy size={14} className="cursor-pointer text-gray-400 hover:text-primary-600" onClick={() => navigator.clipboard.writeText(card.code)}/>
                          </div>
                          <div className="bg-white p-2 rounded border border-dashed border-gray-300 flex justify-between items-center">
                              <span className="font-mono text-gray-600">Seri: {card.serial}</span>
                              <Copy size={14} className="cursor-pointer text-gray-400 hover:text-primary-600" onClick={() => navigator.clipboard.writeText(card.serial)}/>
                          </div>
                      </div>
                  ))}
              </div>
              <Button fullWidth onClick={() => setPurchasedCards(null)}>Đóng</Button>
          </div>
      </Modal>
    </AppShell>
  );
}

export const PricingPage: React.FC = () => {
  const [providers, setProviders] = useState<CardProvider[]>([]);
  const [products, setProducts] = useState<CardProduct[]>([]);

  useEffect(() => {
    Promise.all([mockApi.getProviders(), mockApi.getProducts()]).then(([p, prod]) => {
      setProviders(p);
      setProducts(prod);
    });
  }, []);

  return (
    <AppShell title="Bảng phí & Chiết khấu">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Bảng phí dịch vụ</h2>
        <p className="text-gray-500 text-sm">Cập nhật lần cuối: Hôm nay</p>
      </div>
      
      <div className="space-y-6">
        <PricingMatrix 
            title="Phí đổi thẻ cào (Gạch thẻ)" 
            type="EXCHANGE" 
            providers={providers} 
            products={products} 
        />
        
        <PricingMatrix 
            title="Chiết khấu mua thẻ" 
            type="SHOP" 
            providers={providers} 
            products={products} 
        />
      </div>
    </AppShell>
  );
};

export const UserApiIntegrationPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<UserApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ name: '', callbackUrl: '', ipWhitelist: '' });
  const { addToast } = useToast();

  useEffect(() => {
    mockApi.getUserApiKeys().then(setApiKeys);
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyForm.name) return;
    try {
        await mockApi.registerUserApiKey(newKeyForm);
        const keys = await mockApi.getUserApiKeys();
        setApiKeys(keys);
        setIsModalOpen(false);
        addToast('Tạo khóa API thành công', 'success');
    } catch (e) {
        addToast('Lỗi tạo khóa', 'error');
    }
  };

  const handleDeleteKey = async (id: string) => {
      if(confirm('Bạn có chắc muốn xóa khóa này?')) {
          await mockApi.deleteUserApiKey(id);
          setApiKeys(prev => prev.filter(k => k.id !== id));
          addToast('Đã xóa khóa API', 'success');
      }
  }

  return (
    <AppShell title="Kết nối API">
       <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white border-none">
          <div className="flex items-start gap-4">
             <div className="p-3 bg-white/10 rounded-lg"><Code2 size={24}/></div>
             <div>
                <h2 className="text-lg font-bold mb-1">Tích hợp Website/App</h2>
                <p className="text-blue-100 text-sm mb-4">Kết nối hệ thống của bạn với Napthe247 để gạch thẻ tự động và mua thẻ giá sỉ.</p>
                <div className="flex gap-2">
                    <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 border-none">Xem tài liệu API</Button>
                    <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">Tải Postman Collection</Button>
                </div>
             </div>
          </div>
       </Card>

       <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Danh sách khóa API</h3>
          <Button size="sm" onClick={() => setIsModalOpen(true)}><Plus size={16} className="mr-1"/> Tạo khóa mới</Button>
       </div>

       <div className="space-y-4">
          {apiKeys.map(key => (
              <Card key={key.id} className="relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <h4 className="font-bold text-gray-900">{key.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                              <Badge variant={key.status === 'ACTIVE' ? 'success' : key.status === 'PENDING' ? 'warning' : 'error'}>{key.status}</Badge>
                              <span className="text-xs text-gray-500">{key.createdAt}</span>
                          </div>
                      </div>
                      <button onClick={() => handleDeleteKey(key.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2 text-sm font-mono mt-3">
                      <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Partner ID</div>
                          <div className="font-bold text-gray-800">{key.userId}</div>
                      </div>
                      <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">API Key</div>
                          <div className="flex justify-between items-center">
                              <span className="text-primary-700 font-bold truncate">{key.apiKey}</span>
                              <Copy size={14} className="cursor-pointer text-gray-400" onClick={() => {navigator.clipboard.writeText(key.apiKey); addToast('Copied', 'success')}}/>
                          </div>
                      </div>
                  </div>

                  {(key.callbackUrl || key.ipWhitelist) && (
                      <div className="mt-3 text-xs text-gray-500 grid grid-cols-2 gap-2">
                          <div>
                              <span className="block font-semibold">Callback URL:</span>
                              <span className="truncate block">{key.callbackUrl || 'Chưa cấu hình'}</span>
                          </div>
                          <div>
                              <span className="block font-semibold">IP Whitelist:</span>
                              <span className="truncate block">{key.ipWhitelist || 'Không giới hạn'}</span>
                          </div>
                      </div>
                  )}
              </Card>
          ))}
          {apiKeys.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-gray-50 border border-dashed rounded-xl">
                  Bạn chưa tạo khóa API nào.
              </div>
          )}
       </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo khóa API mới">
           <div className="space-y-4">
               <Input label="Tên gợi nhớ" placeholder="VD: Shop Acc FreeFire" value={newKeyForm.name} onChange={e => setNewKeyForm({...newKeyForm, name: e.target.value})} />
               <Input label="Callback URL (Webhook)" placeholder="https://your-domain.com/api/callback" value={newKeyForm.callbackUrl} onChange={e => setNewKeyForm({...newKeyForm, callbackUrl: e.target.value})} />
               <Input label="IP Whitelist (Tùy chọn)" placeholder="1.2.3.4, 5.6.7.8" value={newKeyForm.ipWhitelist} onChange={e => setNewKeyForm({...newKeyForm, ipWhitelist: e.target.value})} />
               <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded">
                   Khóa API mới sẽ ở trạng thái <strong>Chờ duyệt (PENDING)</strong>. Vui lòng liên hệ Admin để kích hoạt sau khi tạo.
               </div>
               <Button fullWidth onClick={handleCreateKey}>Tạo khóa</Button>
           </div>
       </Modal>
    </AppShell>
  );
};
