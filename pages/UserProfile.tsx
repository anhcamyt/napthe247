import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/Layouts';
import { Card, Button, Badge, ListItem, Tabs, Modal, Switch, PinInput, Input, useToast } from '../components/UIComponents';
import { 
  Globe, 
  Share2, 
  Star, 
  Mail, 
  RotateCcw, 
  Shield, 
  FileText, 
  ChevronRight,
  LogOut,
  Smartphone,
  Key,
  Lock,
  History,
  QrCode,
  CreditCard,
  Landmark,
  Plus,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/api';
import { LoginHistory, User, UserBankAccount } from '../types';

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([]);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Modals State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Forms
  const [bankForm, setBankForm] = useState<Partial<UserBankAccount>>({ bankName: '', accountNumber: '', accountName: '' });

  // 2FA Setup State
  const [qrData, setQrData] = useState<{secret: string, otpauthUrl: string} | null>(null);
  const [is2FAStep, setIs2FAStep] = useState<'INIT' | 'VERIFY'>('INIT');

  useEffect(() => {
    mockApi.getUser().then(setUser);
    mockApi.getLoginHistory().then(setLoginHistory);
    loadBankAccounts();
  }, []);

  const loadBankAccounts = () => {
      mockApi.getUserBankAccounts().then(setBankAccounts);
  };

  const handleToggle2FA = async () => {
    if (user?.security?.twoFactorEnabled) {
        if (confirm('Bạn có chắc muốn tắt xác thực 2 bước? Tài khoản sẽ kém an toàn hơn.')) {
            await mockApi.toggle2FA(false);
            setUser(prev => prev ? { ...prev, security: { ...prev.security!, twoFactorEnabled: false } } : null);
        }
    } else {
        const data = await mockApi.generateTwoFactorSecret();
        setQrData(data);
        setIs2FAStep('INIT');
        setShow2FAModal(true);
    }
  };

  const handleVerify2FA = async (code: string) => {
    const isValid = await mockApi.verifyTwoFactorToken(code);
    if (isValid) {
        await mockApi.toggle2FA(true);
        setUser(prev => prev ? { ...prev, security: { ...prev.security!, twoFactorEnabled: true } } : null);
        setShow2FAModal(false);
        addToast('Kích hoạt bảo mật 2 lớp thành công!', 'success');
    } else {
        addToast('Mã xác thực không đúng. Vui lòng thử lại.', 'error');
    }
  };

  const handleSetPin = (pin: string) => {
    mockApi.updateTransactionPin(pin).then(() => {
        setUser(prev => prev ? { ...prev, security: { ...prev.security!, hasTransactionPin: true } } : null);
        setShowPinModal(false);
        addToast('Cập nhật PIN thành công', 'success');
    });
  };

  const handleAddBank = async () => {
      if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountName) return;
      await mockApi.addUserBankAccount(bankForm);
      loadBankAccounts();
      setShowBankModal(false);
      setBankForm({ bankName: '', accountNumber: '', accountName: '' });
      addToast('Thêm tài khoản thành công', 'success');
  };

  const handleDeleteBank = async (id: string) => {
      if (confirm('Xóa tài khoản này?')) {
          await mockApi.deleteUserBankAccount(id);
          loadBankAccounts();
          addToast('Đã xóa tài khoản', 'success');
      }
  };

  return (
    <AppShell showBottomNav={true}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Hồ sơ <Badge variant="warning" className="text-[10px] px-1.5 h-5">PRO</Badge>
        </h1>
        <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={['Cài đặt chung', 'Ngân hàng', 'Bảo mật']} 
        activeTab={activeTab} 
        onChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 0 && (
        // --- GENERAL SETTINGS ---
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Button 
                fullWidth 
                size="lg" 
                className="mb-4 bg-primary-700 hover:bg-primary-900 shadow-md"
                onClick={() => setShowPasswordModal(true)}
            >
                Đổi mật khẩu
            </Button>

            <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">Tùy chọn</h3>
            <Card noPadding>
                <ListItem 
                icon={<Globe size={20} />} 
                title="Ngôn ngữ" 
                rightElement={<span className="text-sm text-gray-500">Tiếng Việt</span>}
                />
            </Card>
            </div>

            <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">Hỗ trợ</h3>
            <Card noPadding>
                <ListItem icon={<Star size={20} />} title="Đánh giá ứng dụng" />
                <ListItem icon={<Mail size={20} />} title="Gửi phản hồi" />
                <ListItem icon={<FileText size={20} />} title="Điều khoản sử dụng" />
            </Card>
            </div>

            <Button variant="outline" fullWidth className="text-red-600 border-red-100 hover:bg-red-50 mt-4" onClick={() => navigate('/login')}>
                <LogOut size={18} className="mr-2"/> Đăng xuất
            </Button>
        </div>
      )}

      {activeTab === 1 && (
          // --- BANK ACCOUNTS ---
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Button fullWidth onClick={() => setShowBankModal(true)} className="mb-4">
                  <Plus size={18} className="mr-2"/> Thêm tài khoản ngân hàng
              </Button>

              {bankAccounts.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                      Chưa có tài khoản liên kết
                  </div>
              )}

              {bankAccounts.map(bank => (
                  <Card key={bank.id} className="relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                  <Landmark size={20} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900">{bank.bankShortName || bank.bankName}</h4>
                                  <p className="font-mono text-sm text-gray-600 tracking-wider">{bank.accountNumber}</p>
                                  <p className="text-xs text-gray-400 uppercase mt-0.5">{bank.accountName}</p>
                              </div>
                          </div>
                          <button 
                              onClick={() => handleDeleteBank(bank.id)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </Card>
              ))}
          </div>
      )}

      {activeTab === 2 && (
        // --- SECURITY SETTINGS ---
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* 2FA Section */}
            <Card>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Smartphone size={20}/></div>
                        <div>
                            <h4 className="font-bold text-gray-900">Xác thực 2 bước (2FA)</h4>
                            <p className="text-xs text-gray-500">Bảo vệ tài khoản bằng Google Auth</p>
                        </div>
                    </div>
                    <Switch checked={!!user?.security?.twoFactorEnabled} onChange={handleToggle2FA} />
                </div>
                {user?.security?.twoFactorEnabled && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-1">
                        <Shield size={12}/> Tài khoản của bạn đang được bảo vệ an toàn.
                    </div>
                )}
            </Card>

            {/* Transaction PIN Section */}
            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Key size={20}/></div>
                        <div>
                            <h4 className="font-bold text-gray-900">Mã PIN giao dịch</h4>
                            <p className="text-xs text-gray-500">Dùng khi rút tiền & chuyển khoản</p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowPinModal(true)}>
                        {user?.security?.hasTransactionPin ? 'Đổi PIN' : 'Thiết lập'}
                    </Button>
                </div>
            </Card>

            {/* Login History */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1">
                    <History size={14}/> Lịch sử đăng nhập
                </h3>
                <Card noPadding>
                    {loginHistory.map(log => (
                        <div key={log.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-gray-900">{log.device}</span>
                                <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'}>{log.status}</Badge>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{log.location} • {log.ip}</span>
                                <span>{log.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
      )}
      
      {/* Spacer for bottom nav */}
      <div className="h-8"></div>

      {/* --- MODALS --- */}

      {/* Add Bank Modal */}
      <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Liên kết ngân hàng">
          <div className="space-y-4">
              <Input 
                  label="Tên ngân hàng" 
                  placeholder="VD: Vietcombank, MB..." 
                  value={bankForm.bankName} 
                  onChange={e => setBankForm({...bankForm, bankName: e.target.value})} 
              />
              <Input 
                  label="Số tài khoản" 
                  type="number"
                  placeholder="Nhập số tài khoản" 
                  value={bankForm.accountNumber} 
                  onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} 
              />
              <Input 
                  label="Tên chủ tài khoản (In hoa)" 
                  placeholder="NGUYEN VAN A" 
                  value={bankForm.accountName} 
                  onChange={e => setBankForm({...bankForm, accountName: e.target.value.toUpperCase()})} 
              />
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-100">
                  Lưu ý: Tên chủ tài khoản phải trùng với tên định danh của bạn để được duyệt rút tiền nhanh nhất.
              </div>
              <Button fullWidth onClick={handleAddBank}>Lưu thông tin</Button>
          </div>
      </Modal>

      {/* 2FA Modal */}
      <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} title="Cài đặt Google Authenticator">
         <div className="text-center space-y-4">
             {is2FAStep === 'INIT' && qrData && (
                 <>
                    <p className="text-sm text-gray-600">1. Tải ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong>.</p>
                    <p className="text-sm text-gray-600">2. Quét mã QR bên dưới hoặc nhập thủ công.</p>
                    <div className="mx-auto w-48 h-48 bg-white border-2 border-gray-900 rounded-lg p-2 flex items-center justify-center relative overflow-hidden">
                        {/* Simulated QR Code Visual */}
                        <div className="w-full h-full bg-gray-900 flex flex-wrap content-start">
                            {Array.from({length: 100}).map((_, i) => (
                                <div key={i} className={`w-[10%] h-[10%] ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}></div>
                            ))}
                            {/* Center Logo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white p-1 rounded">
                                    <QrCode size={32} className="text-black"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all text-gray-700">
                        {qrData.secret}
                    </div>
                    <Button fullWidth onClick={() => setIs2FAStep('VERIFY')}>Tiếp tục</Button>
                 </>
             )}

             {is2FAStep === 'VERIFY' && (
                 <>
                    <p className="text-sm text-gray-600">3. Nhập 6 số từ ứng dụng xác thực để hoàn tất.</p>
                    <div className="py-4">
                        <PinInput length={6} onComplete={handleVerify2FA} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIs2FAStep('INIT')}>Quay lại quét mã</Button>
                 </>
             )}
         </div>
      </Modal>

      {/* PIN Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Thiết lập PIN giao dịch">
         <div className="space-y-6 text-center">
             <p className="text-sm text-gray-600">Nhập mã PIN 6 số mới để bảo vệ ví của bạn.</p>
             <div className="py-2 flex justify-center">
                <PinInput length={6} onComplete={handleSetPin} />
             </div>
             <p className="text-xs text-gray-400">Không chia sẻ mã PIN này cho bất kỳ ai.</p>
         </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu">
         <div className="space-y-4">
             <Input type="password" label="Mật khẩu hiện tại" placeholder="••••••" />
             <Input type="password" label="Mật khẩu mới" placeholder="••••••" />
             <Input type="password" label="Xác nhận mật khẩu mới" placeholder="••••••" />
             <Button fullWidth onClick={() => {addToast('Đổi mật khẩu thành công', 'success'); setShowPasswordModal(false)}}>Cập nhật</Button>
         </div>
      </Modal>

    </AppShell>
  );
};