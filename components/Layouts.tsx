import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Repeat, 
  ShoppingBag, 
  Wallet, 
  User, 
  Bell, 
  LogOut, 
  Menu,
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  ShieldCheck,
  History,
  Percent,
  ChevronLeft,
  MessageCircle,
  Crown,
  Link2,
  Code2,
  Plug,
  Shield,
  MessageSquare,
  Megaphone,
  BookOpen,
  Banknote,
  X,
  Shuffle,
  Book
} from 'lucide-react';
import { NavItem } from '../types';
import { SupportWidget } from './SupportWidget';

// --- TopBar ---
interface TopBarProps {
  title?: string;
  rightElement?: React.ReactNode;
  isBack?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ title, rightElement, isBack }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        {isBack && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="font-bold text-lg text-primary-900 truncate">
          {title || 'napthe247'}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {rightElement}
      </div>
    </header>
  );
};

// --- BottomNav ---
export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { label: 'Trang chủ', icon: Home, path: '/app/dashboard' },
    { label: 'Đổi thẻ', icon: Repeat, path: '/app/exchange' },
    { label: 'Lịch sử', icon: History, path: '/app/transactions' },
    { label: 'Ví', icon: Wallet, path: '/app/wallet' },
    { label: 'Mua thẻ', icon: ShoppingBag, path: '/app/shop' },
    { label: 'Hồ sơ', icon: User, path: '/app/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- AppShell (User Layout) ---
export const AppShell: React.FC<{ children: React.ReactNode; title?: string; showBottomNav?: boolean; isBack?: boolean }> = ({ 
  children, 
  title, 
  showBottomNav = true,
  isBack = false
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main pb-20 md:pb-0 relative">
      {/* Mobile TopBar - Only show if title provided */}
      {title && (
        <TopBar 
          title={title} 
          isBack={isBack}
          rightElement={
            <div className="flex items-center gap-1">
               <button 
                onClick={() => setIsChatOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
               >
                 <MessageCircle className="h-5 w-5" />
                 {/* Online/Unread Indicator */}
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>
               <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                 <Bell className="h-5 w-5" />
               </button>
            </div>
          }
        />
      )}
      
      <main className="max-w-md mx-auto min-h-screen md:max-w-2xl lg:max-w-4xl w-full">
         <div className="p-4 md:p-6 space-y-4">
           {children}
         </div>
      </main>

      {/* Controlled Chat Widget */}
      <SupportWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {showBottomNav && (
        <div className="md:hidden">
           <BottomNav />
        </div>
      )}
      
      {/* Desktop Sidebar (Optional - Placeholder for now as design is Mobile First) */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-8">
           <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center text-white font-bold">N</div>
           <span className="text-xl font-bold text-primary-900">napthe247</span>
        </div>
        <div className="space-y-1">
           <NavItemDesktop icon={Home} label="Trang chủ" path="/app/dashboard" />
           <NavItemDesktop icon={Repeat} label="Đổi thẻ cào" path="/app/exchange" />
           <NavItemDesktop icon={ShoppingBag} label="Mua mã thẻ" path="/app/shop" />
           <NavItemDesktop icon={Percent} label="Bảng phí" path="/app/pricing" />
           <NavItemDesktop icon={History} label="Lịch sử giao dịch" path="/app/transactions" />
           <NavItemDesktop icon={Wallet} label="Ví của tôi" path="/app/wallet" />
           <NavItemDesktop icon={Code2} label="Kết nối API" path="/app/developer" />
           <NavItemDesktop icon={ShieldCheck} label="Hỗ trợ" path="/app/support" />
           <NavItemDesktop icon={User} label="Hồ sơ cá nhân" path="/app/profile" />
        </div>
        
        {/* Quick Chat Button for Desktop Sidebar */}
        <div className="mt-8 pt-8 border-t border-gray-100">
           <button 
             onClick={() => setIsChatOpen(true)}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all border border-gray-200 hover:border-primary-200 group"
           >
             <div className="relative">
               <MessageCircle className="h-5 w-5 group-hover:text-primary-600" />
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </div>
             <span className="text-sm font-medium">Chat hỗ trợ</span>
           </button>
        </div>
      </div>
    </div>
  );
};

const NavItemDesktop: React.FC<{ icon: any, label: string, path: string }> = ({ icon: Icon, label, path }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);
  return (
    <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

// --- AdminShell ---
export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Lịch sử giao dịch', icon: History, path: '/admin/transactions' }, 
    { label: 'Người dùng', icon: Users, path: '/admin/users' },
    { label: 'Nhóm thành viên', icon: Crown, path: '/admin/groups' },
    { label: 'Bảo mật hệ thống', icon: Shield, path: '/admin/security' },
    { label: 'Kết nối API', icon: Link2, path: '/admin/api-connections' },
    { label: 'Cấu hình luồng thẻ', icon: Shuffle, path: '/admin/routes' }, 
    { label: 'Cấu hình thanh toán', icon: Banknote, path: '/admin/payment-gateways' }, 
    { label: 'Duyệt API User', icon: Plug, path: '/admin/user-apis' },
    { label: 'Kho thẻ', icon: CreditCard, path: '/admin/products' },
    { label: 'Cấu hình bảng phí', icon: Percent, path: '/admin/fees' },
    { label: 'Rút tiền', icon: Wallet, path: '/admin/withdrawals' },
    // New Support Center Menu
    { label: 'Hỗ trợ khách hàng', icon: MessageSquare, path: '/admin/support/inbox' },
    { label: 'Gửi thông báo', icon: Megaphone, path: '/admin/support/broadcast' },
    { label: 'Cơ sở tri thức (FAQ)', icon: BookOpen, path: '/admin/support/faq' },
    // Documentation
    { label: 'Hướng dẫn sử dụng', icon: Book, path: '/admin/documentation' },
    { label: 'Cài đặt hệ thống', icon: Settings, path: '/admin/support/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 font-bold text-xl border-b border-white/10 shrink-0">
          <span>ADMIN CP</span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname.startsWith(item.path);
             return (
               <button
                 key={item.path}
                 onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false); // Close drawer on mobile nav
                 }}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                   isActive ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                 }`}
               >
                 <Icon className="h-5 w-5 shrink-0" />
                 <span className="text-sm font-medium">{item.label}</span>
               </button>
             )
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 shrink-0">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-primary-800">
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-sm md:shadow-none">
          <div className="flex items-center gap-3 md:hidden">
             <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 active:scale-95"
             >
                <Menu className="h-6 w-6" />
             </button>
             <span className="font-bold text-gray-900">Admin Portal</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             <div className="hidden md:block text-sm text-gray-600">Admin User</div>
             <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200">A</div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
};