import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, Minimize2, User, Bot, Loader2, ChevronLeft } from 'lucide-react';
import { Button, Input } from './UIComponents';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'BOT' | 'AGENT';
  content: string;
  timestamp: string;
}

interface SupportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'BOT', content: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?', timestamp: 'Now' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Bot Reply
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'BOT',
        content: 'Cảm ơn bạn. Nhân viên hỗ trợ sẽ phản hồi trong giây lát. Trong lúc chờ đợi, bạn có thể xem phần Câu hỏi thường gặp.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end isolate">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Chat Drawer/Panel */}
      <div className="relative z-10 w-full h-full md:w-[450px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 p-4 flex items-center justify-between text-white shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden p-1 -ml-2 text-white/80 hover:text-white">
              <ChevronLeft size={24} />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bot size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary-900 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Chăm sóc khách hàng</h3>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Online"></span>
              </div>
              <p className="text-xs text-primary-200 flex items-center gap-1">
                Thường trả lời ngay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/90">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
          <div className="text-center py-4">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hôm nay</span>
          </div>
          
          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center mr-2 text-primary-700 shrink-0 shadow-sm">
                    {msg.sender === 'AGENT' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                  isUser 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-primary-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
             <div className="flex justify-start">
                <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center mr-2 text-primary-700 shrink-0 shadow-sm">
                    <Bot size={14} />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0 pb-safe">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-end gap-2"
          >
            <button type="button" className="p-3 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 focus-within:ring-1 focus-within:ring-primary-500 focus-within:bg-white transition-all border border-transparent focus-within:border-primary-200">
               <textarea 
                  placeholder="Nhập tin nhắn..." 
                  className="w-full bg-transparent border-0 text-sm outline-none resize-none max-h-20 py-1"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
               />
            </div>
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg active:scale-95 transform duration-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};