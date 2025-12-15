import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/Layouts';
import { Card, Button, Input, Select, Badge, ListItem } from '../components/UIComponents';
import { Search, Plus, FileText, MessageSquare, ChevronRight, HelpCircle, CheckCircle2, Clock, Send, Paperclip } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../services/api';
import { KbArticle, SupportTicket, TicketStatus, ChatMessage, TicketPriority } from '../types';

// --- Components ---

const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const map = {
    [TicketStatus.NEW]: { color: 'bg-blue-100 text-blue-700', label: 'Mới' },
    [TicketStatus.OPEN]: { color: 'bg-green-100 text-green-700', label: 'Đang xử lý' },
    [TicketStatus.PENDING]: { color: 'bg-orange-100 text-orange-700', label: 'Chờ phản hồi' },
    [TicketStatus.RESOLVED]: { color: 'bg-gray-100 text-gray-700', label: 'Đã xong' },
    [TicketStatus.CLOSED]: { color: 'bg-gray-200 text-gray-500', label: 'Đóng' },
  };
  const s = map[status] || map[TicketStatus.NEW];
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.color}`}>{s.label}</span>;
};

// --- Pages ---

export const SupportDashboard: React.FC = () => {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getKbArticles().then(setArticles);
    mockApi.getTickets().then(setTickets);
  }, []);

  return (
    <AppShell title="Trung tâm hỗ trợ">
      {/* Search Header */}
      <div className="bg-primary-900 rounded-2xl p-6 text-white mb-6">
        <h2 className="text-xl font-bold mb-2">Xin chào, chúng tôi có thể giúp gì?</h2>
        <div className="relative mt-4">
          <input 
            type="text" 
            placeholder="Tìm kiếm câu hỏi, bài viết..." 
            className="w-full h-12 pl-12 pr-4 rounded-xl text-gray-900 text-sm focus:outline-none shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button className="flex-1 shadow-md" onClick={() => navigate('/app/support/create')}>
          <Plus size={18} className="mr-2" /> Tạo khiếu nại
        </Button>
        <Button variant="outline" className="flex-1 bg-white" onClick={() => window.open('#', '_blank')}>
          <MessageSquare size={18} className="mr-2" /> Chat trực tiếp
        </Button>
      </div>

      {/* Recent Tickets */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900">Khiếu nại gần đây</h3>
          <button className="text-xs text-primary-600 font-medium" onClick={() => navigate('/app/support/tickets')}>Xem tất cả</button>
        </div>
        <div className="space-y-3">
          {tickets.slice(0, 3).map(ticket => (
            <Card key={ticket.id} noPadding onClick={() => navigate(`/app/support/ticket/${ticket.id}`)}>
              <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{ticket.subject}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12}/> {ticket.updatedAt}</span>
                  <span className="flex items-center gap-1"><FileText size={12}/> {ticket.category}</span>
                </div>
              </div>
            </Card>
          ))}
          {tickets.length === 0 && (
             <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                Chưa có yêu cầu hỗ trợ nào
             </div>
          )}
        </div>
      </div>

      {/* Knowledge Base */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Câu hỏi thường gặp</h3>
        <Card noPadding>
          {articles.map((article) => (
            <ListItem 
              key={article.id}
              icon={<HelpCircle size={20} className="text-primary-500"/>}
              title={article.title}
              subtitle={`${article.views} lượt xem`}
              hasChevron
            />
          ))}
        </Card>
      </div>
    </AppShell>
  );
};

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'General', description: '' });

  const handleSubmit = async () => {
    setLoading(true);
    await mockApi.createTicket(form);
    setLoading(false);
    navigate('/app/support');
  };

  return (
    <AppShell title="Tạo yêu cầu hỗ trợ">
      <Card>
        <div className="space-y-4">
          <Input 
            label="Tiêu đề" 
            placeholder="Vắn tắt vấn đề của bạn" 
            value={form.subject}
            onChange={e => setForm({...form, subject: e.target.value})}
          />
          <Select 
            label="Danh mục" 
            options={[
              {label: 'Vấn đề chung', value: 'General'},
              {label: 'Nạp/Rút tiền', value: 'Finance'},
              {label: 'Lỗi thẻ cào', value: 'Card Error'},
              {label: 'Tài khoản', value: 'Account'},
            ]}
            value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung chi tiết</label>
            <textarea 
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:border-primary-500 min-h-[120px]"
              placeholder="Mô tả chi tiết vấn đề (Mã giao dịch, seri thẻ...)"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            ></textarea>
          </div>
          <Button fullWidth onClick={handleSubmit} isLoading={loading} disabled={!form.subject || !form.description}>
            Gửi yêu cầu
          </Button>
        </div>
      </Card>
    </AppShell>
  );
};

export const TicketDetail: React.FC = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<SupportTicket | undefined>();
  const [reply, setReply] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
       mockApi.getTicketDetails(id).then(setTicket);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSend = async () => {
    if (!reply.trim() || !ticket) return;
    const newMsg = await mockApi.sendTicketMessage(ticket.id, reply, 'USER');
    setTicket(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : undefined);
    setReply('');
  };

  if (!ticket) return <AppShell><div className="text-center p-8">Loading...</div></AppShell>;

  return (
    <AppShell title={`Chi tiết #${ticket.id}`}>
      {/* Ticket Info Header */}
      <Card className="mb-4 bg-gray-50 border-gray-200">
         <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-gray-900 text-lg">{ticket.subject}</h2>
            <StatusBadge status={ticket.status} />
         </div>
         <div className="text-xs text-gray-500 flex gap-4">
            <span>Danh mục: {ticket.category}</span>
            <span>Ngày tạo: {ticket.createdAt}</span>
         </div>
      </Card>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-280px)] md:h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
           {ticket.messages.map((msg) => {
             const isMe = msg.sender === 'USER';
             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-white border border-gray-100 text-gray-900 rounded-tr-none' 
                      : 'bg-primary-50 border border-primary-100 text-gray-900 rounded-tl-none'
                  }`}>
                     {!isMe && <div className="text-xs font-bold text-primary-700 mb-1">{msg.sender === 'AGENT' ? 'Hỗ trợ viên' : 'Hệ thống'}</div>}
                     <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                     <div className="text-[10px] text-gray-400 mt-1 text-right">{msg.timestamp}</div>
                  </div>
               </div>
             )
           })}
           <div ref={messagesEndRef} />
        </div>
        
        {/* Reply Box */}
        {ticket.status !== TicketStatus.CLOSED && (
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
             <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                <Paperclip size={20} />
             </button>
             <div className="flex-1 relative">
                <textarea 
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-500 outline-none resize-none max-h-32 min-h-[44px]"
                  placeholder="Nhập phản hồi..."
                  rows={1}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
             </div>
             <button 
               className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-sm disabled:opacity-50"
               onClick={handleSend}
               disabled={!reply.trim()}
             >
                <Send size={18} />
             </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};
