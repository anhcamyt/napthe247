import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card, Badge } from '../components/UIComponents';
import { 
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
  LayoutGrid,
  CreditCard,
  Code2,
  PieChart,
  ArrowUpRight,
  Menu,
  Server,
  Lock,
  Building2,
  Phone,
  MessageSquare,
  User,
  LayoutDashboard,
  Headphones,
  ShoppingBag
} from 'lucide-react';

// --- Shared Demo Access Component ---
const DemoAccessSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 justify-center mb-4">
            <span className="h-px w-8 bg-gray-200"></span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Truy cập Demo Nhanh</span>
            <span className="h-px w-8 bg-gray-200"></span>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => navigate('/app/dashboard')}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shadow-sm">
                    <User size={16} />
                </div>
                <div className="text-center">
                    <span className="block text-xs font-bold text-gray-900 group-hover:text-blue-700">Khách hàng</span>
                </div>
            </button>
            <button 
                onClick={() => navigate('/admin/dashboard')}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors shadow-sm">
                    <Shield size={16} />
                </div>
                <div className="text-center">
                    <span className="block text-xs font-bold text-gray-900 group-hover:text-purple-700">Admin</span>
                </div>
            </button>
        </div>
    </div>
  );
};

// --- Authentication Layout Component ---
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    
    const features = [
        {
            icon: Zap,
            color: 'bg-orange-100 text-orange-600',
            title: 'Gạch thẻ tự động 5s',
            desc: 'Hệ thống xử lý thẻ cào siêu tốc, ổn định, sản lượng lớn không lo nghẽn.'
        },
        {
            icon: ShoppingBag,
            color: 'bg-purple-100 text-purple-600',
            title: 'Kho thẻ số & Topup',
            desc: 'Cung cấp mã thẻ game, thẻ điện thoại với chiết khấu tốt nhất thị trường.'
        },
        {
            icon: Code2,
            color: 'bg-blue-100 text-blue-600',
            title: 'Tích hợp API dễ dàng',
            desc: 'Tài liệu chuẩn RESTful, tích hợp vào Website/App shop game chỉ trong 5 phút.'
        },
        {
            icon: Headphones,
            color: 'bg-green-100 text-green-600',
            title: 'Hỗ trợ kỹ thuật 24/7',
            desc: 'Đội ngũ support chuyên nghiệp, hỗ trợ đối soát và xử lý lỗi ngay lập tức.'
        }
    ];

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center p-6 md:p-12 xl:p-24 relative overflow-y-auto">
                <div className="mb-10 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">N</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">napthe247</span>
                    </div>
                </div>
                
                <div className="w-full max-w-md mx-auto">
                    {children}
                </div>

                <div className="mt-12 text-xs text-gray-400">
                    &copy; 2024 Napthe247 Inc. <a href="#" className="hover:text-primary-700 ml-2">Privacy</a> &bull; <a href="#" className="hover:text-primary-700 ml-1">Terms</a>
                </div>
            </div>

            {/* Right Side - Info (Hidden on Mobile) */}
            <div className="hidden lg:flex w-[55%] bg-gray-50 flex-col justify-center px-16 xl:px-24 relative border-l border-gray-100">
                <div className="max-w-lg space-y-10">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex gap-5 items-start group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${feature.color} transition-transform group-hover:scale-110 duration-300`}>
                                <feature.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary-700 transition-colors">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>
        </div>
    );
};

// --- Login Page ---
export const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/dashboard');
  };

  return (
    <AuthLayout>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
        <p className="text-gray-500 mb-8">Truy cập vào hệ thống quản lý tài sản số của bạn.</p>

        <form onSubmit={handleLogin} className="space-y-5">
            <Input 
                label="Email hoặc số điện thoại" 
                placeholder="Ví dụ: name@company.com" 
                className="bg-white"
            />
            
            <div className="space-y-1">
                <Input 
                    label="Mật khẩu" 
                    type="password" 
                    placeholder="Nhập mật khẩu của bạn" 
                />
                <div className="flex justify-end">
                    <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                        Quên mật khẩu?
                    </a>
                </div>
            </div>

            <Button 
                fullWidth 
                size="lg" 
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold h-12 shadow-lg shadow-primary-600/20 text-base"
            >
                Đăng nhập
            </Button>
        </form>

        <div className="mt-6">
            <Link to="/register">
                <Button 
                    fullWidth 
                    size="lg" 
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold h-12"
                >
                    Đăng ký tài khoản mới
                </Button>
            </Link>
        </div>

        <DemoAccessSection />
    </AuthLayout>
  );
};

// --- Register Page ---
export const Register: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <AuthLayout>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</h1>
             <p className="text-gray-500 mb-8">Bắt đầu tích hợp thanh toán và đổi thẻ ngay hôm nay.</p>

             <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Họ tên" placeholder="Nguyễn Văn A" />
                    <Input label="Số điện thoại" placeholder="09xxxx" />
                </div>
                <Input label="Email công việc" placeholder="name@company.com" />
                <Input label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" />
                
                <div className="flex items-start gap-2 mt-2">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-500">
                        Tôi đồng ý với <a href="#" className="text-primary-600 font-semibold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-primary-600 font-semibold hover:underline">Chính sách bảo mật</a> của Napthe247.
                    </span>
                </div>

                <Button fullWidth size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-bold h-12 shadow-lg shadow-primary-600/20 text-base" onClick={() => navigate('/app/dashboard')}>
                    Đăng ký miễn phí
                </Button>
             </form>

             <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Đã có tài khoản? <Link to="/login" className="text-primary-600 font-bold hover:underline">Đăng nhập ngay</Link>
                </p>
             </div>
        </AuthLayout>
    )
}

// --- TRANG CHỦ FINTECH B2B (VIETNAMESE) ---
export const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary-100 selection:text-primary-900">
      
      {/* 1. Navigation */}
      <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">N</div>
             <span className="text-xl font-bold text-gray-900 tracking-tight">napthe247</span>
           </div>
           
           <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
             <a href="#solutions" className="hover:text-primary-900 transition-colors">Giải pháp</a>
             <a href="#developers" className="hover:text-primary-900 transition-colors">Lập trình viên</a>
             <a href="#enterprise" className="hover:text-primary-900 transition-colors">Doanh nghiệp</a>
             <a href="#pricing" className="hover:text-primary-900 transition-colors">Bảng phí</a>
           </div>

           <div className="flex items-center gap-4">
             <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium text-gray-900 hover:text-primary-700 transition-colors">Đăng nhập</button>
             <button onClick={() => navigate('/register')} className="bg-primary-900 hover:bg-primary-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-lg shadow-primary-900/10">
                Bắt đầu ngay
             </button>
           </div>
        </div>
      </nav>
      
      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
           <div className="grid lg:grid-cols-2 gap-12 items-center">
             <div className="max-w-2xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 mb-8 tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  API v2.0 đã sẵn sàng
               </div>
               <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-8">
                 Hạ tầng tài chính cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-800 to-blue-600">nền kinh tế số</span>
               </h1>
               <p className="text-xl text-gray-500 leading-relaxed max-w-lg mb-10 font-light">
                 Nền tảng hợp nhất giúp quản lý tài sản số, tự động hóa thanh toán và mở rộng quy mô kinh doanh toàn cầu. Bảo mật, minh bạch và tối ưu cho developer.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => navigate('/register')} className="bg-primary-900 text-white h-14 px-8 rounded-full font-medium text-lg hover:bg-primary-800 transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2">
                   Tích hợp ngay <ArrowRight className="w-5 h-5" />
                 </button>
                 <button className="bg-white text-gray-900 border border-gray-200 h-14 px-8 rounded-full font-medium text-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                   Liên hệ tư vấn
                 </button>
               </div>
             </div>
             
             {/* Visual Hero Image */}
             <div className="relative hidden lg:block">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl transform scale-110 opacity-60"></div>
                 <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                    alt="Fintech Dashboard Analytics" 
                    className="relative rounded-2xl shadow-2xl border border-gray-200 object-cover w-full h-auto transform hover:-translate-y-2 transition-transform duration-500"
                 />
                 {/* Floating Card Overlay */}
                 <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-xl shadow-xl border border-gray-100 max-w-xs animate-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center gap-4 mb-3">
                       <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <ArrowUpRight className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="text-sm text-gray-500">Doanh thu hôm nay</div>
                          <div className="text-xl font-bold text-gray-900">+128.5 Tr VNĐ</div>
                       </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-green-500 w-[75%] h-full rounded-full"></div>
                    </div>
                 </div>
             </div>
           </div>
        </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Đối tác chiến lược của 5,000+ doanh nghiệp công nghệ</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Using placeholders for partner logos */}
             <span className="text-2xl font-black text-gray-800">VIETTEL</span>
             <span className="text-2xl font-black text-gray-800">VINAPHONE</span>
             <span className="text-2xl font-black text-gray-800">MOMO</span>
             <span className="text-2xl font-black text-gray-800">ZALOPAY</span>
             <span className="text-2xl font-black text-gray-800">VNPAY</span>
          </div>
        </div>
      </section>

      {/* 4. Core Solutions */}
      <section id="solutions" className="py-24 lg:py-32">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">Bộ giải pháp toàn diện cho tài sản số</h2>
              <p className="text-xl text-gray-500 font-light leading-relaxed">
                Chúng tôi đơn giản hóa sự phức tạp của việc trao đổi tài sản số, quản lý kho và thanh toán thành một nền tảng tích hợp duy nhất.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               <FeatureCard 
                  icon={ArrowUpRight}
                  title="Thanh khoản tức thì"
                  desc="Chuyển đổi thẻ cào và tài sản số thành tiền mặt ngay lập tức. Xử lý thời gian thực với tỷ giá cạnh tranh nhất thị trường."
               />
               <FeatureCard 
                  icon={Code2}
                  title="API Hợp nhất"
                  desc="Tích hợp một lần, kết nối đa nhà mạng và nhà phát hành game. API chuẩn RESTful được thiết kế tối ưu cho lập trình viên."
               />
               <FeatureCard 
                  icon={Server}
                  title="Quản lý kho thẻ"
                  desc="Tự động hóa kho thẻ số. Mua, lưu trữ và phân phối mã thẻ soft-pin với độ ổn định hệ thống 99.99%."
               />
               <FeatureCard 
                  icon={PieChart}
                  title="Phân tích thời gian thực"
                  desc="Dashboard toàn diện giúp theo dõi dòng tiền, tỷ lệ thành công và các chỉ số kinh doanh quan trọng real-time."
               />
               <FeatureCard 
                  icon={Shield}
                  title="Ngăn chặn gian lận"
                  desc="Bảo mật cấp doanh nghiệp với AI phát hiện gian lận chủ động để bảo vệ giao dịch và số dư của bạn."
               />
               <FeatureCard 
                  icon={Globe}
                  title="Thanh toán đa quốc gia"
                  desc="Hỗ trợ rút tiền linh hoạt về ngân hàng và ví điện tử. Hỗ trợ đa tiền tệ cho các doanh nghiệp quốc tế."
               />
            </div>
         </div>
      </section>

      {/* 5. How it Works / Developer Focus */}
      <section id="developers" className="py-24 bg-gray-900 text-white overflow-hidden relative">
         {/* Background decoration */}
         <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary-900/80 to-transparent pointer-events-none"></div>
         <img 
            src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
            alt="Code background"
         />
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-800/50 border border-primary-700/50 text-xs font-semibold text-primary-300 mb-6 tracking-wide uppercase">
                    Dành cho Developer
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Xây dựng để mở rộng,<br/>thiết kế cho tốc độ.</h2>
                  <p className="text-lg text-gray-400 mb-8 font-light leading-relaxed">
                     Hạ tầng của chúng tôi xử lý hàng triệu giao dịch mỗi ngày với <span className="text-white font-medium">zero downtime</span>. 
                     Bắt đầu thử nghiệm trong môi trường Sandbox và go-live chỉ trong vài phút.
                  </p>
                  
                  <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Cam kết Uptime 99.99%</span>
                     </li>
                     <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Webhooks & Real-time callbacks</span>
                     </li>
                     <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Tài liệu kỹ thuật chi tiết & SDK</span>
                     </li>
                  </ul>
                  
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 h-12 px-6 rounded-full font-medium border-0">
                     Xem tài liệu API
                  </Button>
               </div>
               
               {/* Code Snippet Visual */}
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative bg-gray-950 rounded-2xl border border-gray-800 p-6 font-mono text-sm shadow-2xl overflow-hidden">
                     {/* Window controls */}
                     <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-gray-500 text-xs font-sans">POST /api/v2/exchange</span>
                     </div>
                     
                     <div className="text-blue-400">const <span className="text-white">transaction</span> = <span className="text-purple-400">await</span> client.exchange.create({'{'}</div>
                     <div className="pl-4 text-green-300">provider: <span className="text-orange-300">'VIETTEL'</span>,</div>
                     <div className="pl-4 text-green-300">code: <span className="text-orange-300">'1234567890123'</span>,</div>
                     <div className="pl-4 text-green-300">serial: <span className="text-orange-300">'999888777'</span>,</div>
                     <div className="pl-4 text-green-300">amount: <span className="text-orange-300">50000</span>,</div>
                     <div className="pl-4 text-green-300">callback_url: <span className="text-orange-300">'https://api.domain.com/webhook'</span></div>
                     <div className="text-blue-400">{'}'});</div>
                     <br/>
                     <div className="text-gray-500">// Response thành công</div>
                     <div className="text-white">{'{'}</div>
                     <div className="pl-4 text-green-300">"status": <span className="text-orange-300">"PENDING"</span>,</div>
                     <div className="pl-4 text-green-300">"id": <span className="text-orange-300">"txn_839201"</span>,</div>
                     <div className="pl-4 text-green-300">"timestamp": <span className="text-orange-300">"2023-10-25T10:00:00Z"</span></div>
                     <div className="text-white">{'}'}</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. Global Scale / Map */}
      <section id="enterprise" className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">Vận hành quy mô toàn cầu</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-16 font-light">
               Hỗ trợ doanh nghiệp vươn ra biển lớn. Hệ thống đa tiền tệ và phương thức thanh toán bản địa hóa giúp mở rộng thị trường không giới hạn.
            </p>
            
            {/* World Map Background Image */}
            <div className="relative w-full max-w-5xl mx-auto aspect-[16/8] bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center overflow-hidden">
               <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/23/Blue_Marble_2002.png" 
                  alt="World Map"
                  className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale contrast-150" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>

               <div className="relative z-10 grid grid-cols-3 gap-8 text-left md:gap-20">
                  <StatItem label="Giao dịch hàng năm" value="$250M+" />
                  <StatItem label="Quốc gia hỗ trợ" value="12" />
                  <StatItem label="Thời gian hoạt động" value="99.99%" />
               </div>
               
               {/* Decorative pulses on map */}
               <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
               <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary-500 rounded-full animate-ping delay-300"></div>
               <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-ping delay-700"></div>
            </div>
         </div>
      </section>
      
      {/* 7. Security & Compliance */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Bảo mật tiêu chuẩn quốc tế</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                     Chúng tôi tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật quốc tế để đảm bảo tiền và dữ liệu của bạn luôn an toàn 24/7.
                  </p>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-600">
                        <Lock className="w-4 h-4 text-green-600" /> Mã hóa SSL 256-bit
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-600">
                        <Shield className="w-4 h-4 text-blue-600" /> Tuân thủ PCI DSS
                     </div>
                  </div>
               </div>
               <div className="flex-1 flex justify-end gap-8 opacity-80">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                     </div>
                     <span className="text-xs font-semibold text-gray-400">BANKING</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Server className="w-8 h-8 text-gray-400" />
                     </div>
                     <span className="text-xs font-semibold text-gray-400">DATA</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-gray-400" />
                     </div>
                     <span className="text-xs font-semibold text-gray-400">SECURITY</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-24 bg-white text-center">
         <div className="max-w-3xl mx-auto px-4">
           <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Sẵn sàng bứt phá doanh thu?</h2>
           <p className="text-xl text-gray-500 mb-10 font-light">
             Gia nhập nền tảng hạ tầng tài chính phát triển nhanh nhất dành cho doanh nghiệp số ngay hôm nay.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate('/register')} className="bg-primary-900 text-white h-14 px-10 rounded-full font-medium text-lg hover:bg-primary-800 transition-all shadow-xl shadow-primary-900/20">
                Tạo tài khoản miễn phí
              </button>
              <button className="bg-white text-gray-900 border border-gray-200 h-14 px-10 rounded-full font-medium text-lg hover:bg-gray-50 transition-all">
                Liên hệ bộ phận Sales
              </button>
           </div>
         </div>
      </section>
      
      {/* 9. Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
               <div className="col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                     <div className="w-6 h-6 bg-primary-900 rounded flex items-center justify-center text-white font-bold text-xs">N</div>
                     <span className="text-lg font-bold text-gray-900">napthe247</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
                    Thế hệ tiếp theo của hạ tầng tài chính. Tự động hóa trao đổi giá trị tài sản số cho web hiện đại.
                  </p>
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center transition-colors cursor-pointer text-gray-400">
                        <Globe size={14}/>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center transition-colors cursor-pointer text-gray-400">
                        <MessageSquare size={14}/>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center transition-colors cursor-pointer text-gray-400">
                        <Phone size={14}/>
                     </div>
                  </div>
               </div>
               
               <div>
                  <h4 className="font-bold text-gray-900 mb-6">Sản phẩm</h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-primary-900">Exchange API</a></li>
                     <li><a href="#" className="hover:text-primary-900">Kho thẻ số</a></li>
                     <li><a href="#" className="hover:text-primary-900">Cổng thanh toán</a></li>
                     <li><a href="#" className="hover:text-primary-900">Bảng giá</a></li>
                  </ul>
               </div>
               
               <div>
                  <h4 className="font-bold text-gray-900 mb-6">Công ty</h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-primary-900">Về chúng tôi</a></li>
                     <li><a href="#" className="hover:text-primary-900">Tuyển dụng</a></li>
                     <li><a href="#" className="hover:text-primary-900">Tin tức (Blog)</a></li>
                     <li><a href="#" className="hover:text-primary-900">Liên hệ</a></li>
                  </ul>
               </div>
               
               <div>
                  <h4 className="font-bold text-gray-900 mb-6">Pháp lý</h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-primary-900">Chính sách bảo mật</a></li>
                     <li><a href="#" className="hover:text-primary-900">Điều khoản sử dụng</a></li>
                     <li><a href="#" className="hover:text-primary-900">Chính sách tuân thủ</a></li>
                     <li><a href="#" className="hover:text-primary-900">Trạng thái hệ thống</a></li>
                  </ul>
               </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400">© 2024 Napthe247 Inc. All rights reserved.</p>

              <div className="flex gap-4 text-xs font-medium bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Demo Links:</span>
                  <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/app/dashboard" className="text-gray-500 hover:text-primary-600">User App</Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/admin/dashboard" className="text-gray-500 hover:text-primary-600">Admin Portal</Link>
              </div>

              <div className="flex gap-6 text-xs text-gray-400">
                 <span>Hanoi, VN</span>
                 <span>Singapore, SG</span>
              </div>
            </div>
         </div>
      </footer>
    </div>
  )
}

// --- Helper Components ---

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 group">
     <div className="w-12 h-12 bg-primary-50 text-primary-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
        <Icon className="w-6 h-6" />
     </div>
     <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">{title}</h3>
     <p className="text-gray-500 leading-relaxed font-light text-sm">{desc}</p>
  </div>
)

const StatItem = ({ label, value }: any) => (
  <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100">
     <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
     <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
  </div>
)