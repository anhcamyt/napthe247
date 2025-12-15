import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '../components/Layouts';
import { Card, Button, Badge, Select, Input, Modal, useToast } from '../components/UIComponents';
import { TransactionTable, TransactionDetailContent, TransactionAnalytics } from '../components/TransactionUI';
import { mockApi } from '../services/api';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { Search, ShieldCheck, Filter, Calendar, X, PieChart, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Helper to parse "dd/MM/yyyy HH:mm" to Date object
const parseTransactionDate = (dateStr: string): Date => {
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    // Create ISO string YYYY-MM-DDTHH:mm:00
    return new Date(`${year}-${month}-${day}T${timePart || '00:00'}:00`);
  } catch (e) {
    return new Date();
  }
};

// --- Transaction Detail Page (Legacy - kept for deep links if needed) ---
export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       mockApi.getTransactionDetail(id).then(t => {
         setTransaction(t || null);
         setLoading(false);
       });
    }
  }, [id]);

  if (loading) return (
    <AppShell isBack title="Chi tiết giao dịch">
        <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
    </AppShell>
  );
  
  if (!transaction) return (
    <AppShell isBack title="Lỗi">
        <div className="p-12 text-center text-gray-400">Không tìm thấy giao dịch #{id}</div>
    </AppShell>
  );

  return (
    <AppShell isBack title={`Giao dịch #${transaction.id}`}>
        <Card>
            <TransactionDetailContent transaction={transaction} />
        </Card>
    </AppShell>
  );
};

// --- User Transaction History ---
export const TransactionHistoryPage: React.FC = () => {
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Modals
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false); // New State for Analytics

  // Quick Report Templates
  const reportTemplates = [
    { label: 'Thẻ đúng báo sai', content: 'Tôi khẳng định thẻ này đúng, mã và seri chính xác. Tại sao hệ thống lại báo sai/thẻ lỗi? Nhờ admin kiểm tra lại với nhà mạng.' },
    { label: 'Rút tiền chưa về', content: 'Hệ thống báo rút tiền thành công nhưng tài khoản ngân hàng của tôi vẫn chưa nhận được tiền. Vui lòng kiểm tra.' },
    { label: 'Thẻ mua bị lỗi', content: 'Mã thẻ tôi vừa mua báo lỗi hoặc đã bị sử dụng khi nạp. Mong được hỗ trợ bảo hành.' },
    { label: 'Sai mệnh giá', content: 'Tôi chọn nhầm mệnh giá khi gửi thẻ, nhờ admin hỗ trợ sửa lại mệnh giá đúng.' }
  ];

  const fetchTransactions = () => {
    setLoading(true);
    mockApi.getTransactions()
      .then(data => setRawTransactions(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter(tx => {
      // 1. Search Text
      const searchMatch = !searchText || 
        tx.id.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.shortDescription.toLowerCase().includes(searchText.toLowerCase()) ||
        (tx.metadata?.serial && tx.metadata.serial.includes(searchText));

      // 2. Type Filter
      const typeMatch = filterType === 'ALL' || tx.type === filterType;

      // 3. Date Range
      let dateMatch = true;
      if (startDate || endDate) {
        const txDate = parseTransactionDate(tx.createdAt);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (txDate < start) dateMatch = false;
        }
        if (endDate && dateMatch) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (txDate > end) dateMatch = false;
        }
      }

      return searchMatch && typeMatch && dateMatch;
    });
  }, [rawTransactions, searchText, filterType, startDate, endDate]);

  // Statistics Calculation (Simple Summary)
  const stats = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      acc.totalCount++;
      acc.totalAmount += tx.amount;
      if (tx.status === TransactionStatus.SUCCESS) {
        acc.successAmount += tx.amount;
        acc.successCount++;
      }
      return acc;
    }, { totalCount: 0, totalAmount: 0, successCount: 0, successAmount: 0 });
  }, [filteredTransactions]);

  // Reset Filters
  const clearFilters = () => {
    setSearchText('');
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenReport = () => {
      setReportReason('');
      setIsReportModalOpen(true);
      // Optional: Close details modal if desired, or keep it open behind.
      // setSelectedTx(null); 
  };

  const handleSubmitReport = async () => {
      if (!selectedTx || !reportReason.trim()) return;
      setIsReporting(true);
      try {
          await mockApi.createTicket({
              subject: `Khiếu nại giao dịch #${selectedTx.id}`,
              description: reportReason + `\n\n[System Info]\nTxID: ${selectedTx.id}\nAmount: ${selectedTx.amount}\nStatus: ${selectedTx.status}`,
              category: selectedTx.type === TransactionType.CARD_EXCHANGE ? 'Card Error' : 'Finance'
          });
          addToast('Đã gửi khiếu nại thành công', 'success');
          setIsReportModalOpen(false);
          setSelectedTx(null); // Close detail modal too
      } catch (e) {
          addToast('Gửi khiếu nại thất bại', 'error');
      } finally {
          setIsReporting(false);
      }
  };

  return (
    <AppShell title="Lịch sử giao dịch">
      
      {/* Search & Filter Controls */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="Tìm mã GD, serial, nội dung..." 
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
             />
          </div>
          <Button 
            variant={showFilters ? 'primary' : 'outline'} 
            className={showFilters ? '' : 'bg-white'} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" /> Bộ lọc
          </Button>
          <Button
            variant={showAnalytics ? 'secondary' : 'outline'}
            className={showAnalytics ? '' : 'bg-white'}
            onClick={() => setShowAnalytics(!showAnalytics)}
            title="Thống kê chi tiết"
          >
             <PieChart size={16} />
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-2">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Select 
                  label="Loại dịch vụ"
                  options={[
                    { label: 'Tất cả dịch vụ', value: 'ALL' },
                    { label: 'Đổi thẻ cào', value: TransactionType.CARD_EXCHANGE },
                    { label: 'Mua mã thẻ', value: TransactionType.CARD_PURCHASE },
                    { label: 'Nạp tiền (Bank)', value: TransactionType.WALLET_TOPUP },
                    { label: 'Rút tiền', value: TransactionType.WALLET_WITHDRAW },
                  ]}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                />
                
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ ngày</label>
                   <div className="relative">
                      <input 
                        type="date" 
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary-500"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến ngày</label>
                   <div className="relative">
                      <input 
                        type="date" 
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary-500"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                   </div>
                </div>
             </div>
             
             <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-3"
                >
                  <X size={14} className="mr-1"/> Xóa bộ lọc
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Analytics Section (Conditional) */}
      {showAnalytics && (
        <TransactionAnalytics transactions={filteredTransactions} />
      )}

      {/* Transaction List */}
      <Card noPadding className="overflow-hidden min-h-[300px]">
         {loading ? (
           <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
         ) : filteredTransactions.length > 0 ? (
           <TransactionTable 
              transactions={filteredTransactions} 
              onViewDetail={(tx) => setSelectedTx(tx)} 
           />
         ) : (
           <div className="p-12 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
               <Search size={24} />
             </div>
             <p className="text-gray-500 font-medium">Không tìm thấy giao dịch nào</p>
             <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
           </div>
         )}
      </Card>

      {/* Simple Statistics Footer (Hidden if Analytics is open to avoid clutter) */}
      {!loading && filteredTransactions.length > 0 && !showAnalytics && (
        <div className="mt-4 grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
           <Card className="bg-primary-900 text-white border-primary-800">
              <p className="text-primary-200 text-xs font-medium uppercase tracking-wider mb-1">Tổng tiền (Input)</p>
              <h3 className="text-xl font-bold">{stats.totalAmount.toLocaleString()} đ</h3>
              <p className="text-xs text-primary-300 mt-1">{stats.totalCount} giao dịch</p>
           </Card>
           
           <Card className="bg-green-600 text-white border-green-500">
              <p className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Thực thành công</p>
              <h3 className="text-xl font-bold">{stats.successAmount.toLocaleString()} đ</h3>
              <p className="text-xs text-green-200 mt-1">{stats.successCount} giao dịch thành công</p>
           </Card>
        </div>
      )}

      {/* --- Detail Modal --- */}
      <Modal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        title={`Chi tiết giao dịch`}
      >
          {selectedTx && (
              <TransactionDetailContent 
                  transaction={selectedTx} 
                  onReport={handleOpenReport}
              />
          )}
      </Modal>

      {/* --- Report Modal --- */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Gửi khiếu nại"
      >
          <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-sm text-orange-800">
                  <p>Bạn đang khiếu nại về giao dịch <strong>#{selectedTx?.id}</strong>.</p>
                  <p className="text-xs mt-1 text-orange-600">Vui lòng mô tả chi tiết vấn đề để được hỗ trợ nhanh nhất.</p>
              </div>
              
              {/* Quick Templates */}
              <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare size={12}/> Mẫu tin nhắn nhanh
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {reportTemplates.map((template, index) => (
                       <button
                          key={index}
                          onClick={() => setReportReason(template.content)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 transition-colors text-left"
                       >
                          {template.label}
                       </button>
                    ))}
                 </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung khiếu nại</label>
                  <textarea 
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[120px]"
                      placeholder="Nhập nội dung hoặc chọn mẫu ở trên..."
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                  />
              </div>
              <Button fullWidth onClick={handleSubmitReport} isLoading={isReporting} disabled={!reportReason.trim()}>
                  Gửi yêu cầu hỗ trợ
              </Button>
          </div>
      </Modal>

    </AppShell>
  );
};

// --- Guest Lookup Page ---
export const GuestLookupPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!code.trim()) return;
     
     setLoading(true);
     setError('');
     setResult(null);

     try {
       const tx = await mockApi.guestLookupTransaction(code);
       if (tx) {
         setResult(tx);
       } else {
         setError('Không tìm thấy giao dịch. Vui lòng kiểm tra lại mã.');
       }
     } catch (err) {
       setError('Có lỗi xảy ra hoặc mã không tồn tại.');
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
       <div className="max-w-md w-full">
          <div className="text-center mb-8" onClick={() => navigate('/')}>
             <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 cursor-pointer">N</div>
             <h1 className="text-2xl font-bold text-gray-900">Tra cứu đơn hàng</h1>
             <p className="text-gray-500 text-sm">Nhập mã giao dịch để kiểm tra trạng thái</p>
          </div>

          <Card className="p-6 mb-6">
             <form onSubmit={handleLookup} className="space-y-4">
                <Input 
                   label="Mã giao dịch / Mã đơn hàng" 
                   placeholder="VD: TXN-998811" 
                   value={code}
                   onChange={(e) => setCode(e.target.value)}
                />
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white"></div>
                   <span className="text-sm text-gray-600">Xác thực người dùng (Captcha)</span>
                   <ShieldCheck className="h-5 w-5 ml-auto text-green-600 opacity-50" />
                </div>

                <Button fullWidth size="lg" isLoading={loading}>Kiểm tra ngay</Button>
             </form>

             {error && (
               <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <ShieldCheck size={16}/> {error}
               </div>
             )}
          </Card>

          {result && (
             <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="flex justify-between items-center mb-2 px-2">
                   <h3 className="font-bold text-gray-900">Kết quả tra cứu</h3>
                   <span className="text-xs text-gray-500">Vừa cập nhật</span>
                </div>
                <Card className="p-0 overflow-hidden">
                   <div className="p-4 bg-primary-900 text-white flex justify-between items-center">
                      <div>
                         <div className="text-primary-200 text-xs uppercase tracking-wider">Mã đơn</div>
                         <div className="font-mono font-bold text-lg">{result.id}</div>
                      </div>
                      <Badge variant={
                          result.status === 'SUCCESS' ? 'success' :
                          result.status === 'FAILED' ? 'error' : 'warning'
                      }>
                         {result.status}
                      </Badge>
                   </div>
                   <div className="p-4 space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-50">
                         <span className="text-gray-500 text-sm">Dịch vụ</span>
                         <span className="font-medium text-gray-900">{result.shortDescription}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-50">
                         <span className="text-gray-500 text-sm">Số tiền</span>
                         <span className="font-bold text-gray-900">{result.amount.toLocaleString()} đ</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-50">
                         <span className="text-gray-500 text-sm">Thời gian</span>
                         <span className="font-medium text-gray-900">{result.createdAt}</span>
                      </div>
                      {result.metadata && Object.entries(result.metadata).map(([k, v]) => {
                         if (['serial', 'code', 'adminNote'].includes(k)) return null;
                         return (
                           <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                              <span className="text-gray-500 text-sm capitalize">{k}</span>
                              <span className="font-medium text-gray-900 text-right">{String(v)}</span>
                           </div>
                         )
                      })}
                   </div>
                   <div className="p-4 bg-gray-50 text-center">
                      <Button variant="outline" size="sm" onClick={() => {setCode(''); setResult(null);}}>Tra cứu đơn khác</Button>
                   </div>
                </Card>
             </div>
          )}
       </div>
    </div>
  );
};