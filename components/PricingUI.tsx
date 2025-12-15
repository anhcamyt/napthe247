import React, { useState, useEffect } from 'react';
import { CardProduct, CardProvider } from '../types';
import { Card, Button, Modal, Input, Badge, Select } from './UIComponents';
import { Edit2, Save, Info, Settings, RefreshCw, Lock, Unlock, Zap, X, AlertCircle } from 'lucide-react';

interface PricingMatrixProps {
  title: string;
  type: 'EXCHANGE' | 'SHOP'; // EXCHANGE = Phí đổi thẻ (Discount Fee), SHOP = Chiết khấu mua (Buy Discount)
  providers: CardProvider[];
  products: CardProduct[];
  isEditable?: boolean;
  onUpdate?: (updates: Partial<CardProduct>[]) => void;
}

const DENOMINATIONS = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000];

export const PricingMatrix: React.FC<PricingMatrixProps> = ({ 
  title, 
  type, 
  providers, 
  products, 
  isEditable = false,
  onUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [localProducts, setLocalProducts] = useState<CardProduct[]>(products);
  const [changes, setChanges] = useState<{ [key: string]: Partial<CardProduct> }>({});
  
  // Config Modal State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedProviderConfig, setSelectedProviderConfig] = useState<CardProvider | null>(null);
  const [tempConfig, setTempConfig] = useState({ mode: 'MANUAL', margin: 0 });

  // User View State
  const [activeCategory, setActiveCategory] = useState<'TELCO' | 'GAME'>('TELCO');
  const [activeProviderId, setActiveProviderId] = useState<string>('');

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const telcoProviders = providers.filter(p => p.type === 'TELCO');
  const gameProviders = providers.filter(p => p.type === 'GAME');
  const categoryProviders = activeCategory === 'TELCO' ? telcoProviders : gameProviders;

  useEffect(() => {
    if (categoryProviders.length > 0) {
      const exists = categoryProviders.find(p => p.id === activeProviderId);
      if (!exists) {
        setActiveProviderId(categoryProviders[0].id);
      }
    } else {
      setActiveProviderId('');
    }
  }, [activeCategory, providers]);

  const getProduct = (providerCode: string, value: number) => {
    return localProducts.find(p => p.providerCode === providerCode && p.value === value);
  };

  const getDisplayValue = (product: CardProduct | undefined) => {
    if (!product) return 0;
    
    if (type === 'EXCHANGE') {
      const fee = 100 - product.exchangeRate;
      return Number(fee.toFixed(1));
    } else {
      return Number(product.buyDiscount.toFixed(1));
    }
  };

  const handleInputChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (isNaN(val)) return;

    setChanges(prev => ({ 
        ...prev, 
        [productId]: { ...prev[productId], id: productId, [type === 'EXCHANGE' ? 'exchangeRate' : 'buyDiscount']: type === 'EXCHANGE' ? 100 - val : val } 
    }));
    
    setLocalProducts(prev => prev.map(p => {
      if (p.id === productId) {
        if (type === 'EXCHANGE') {
           return { ...p, exchangeRate: 100 - val };
        } else {
           return { ...p, buyDiscount: val };
        }
      }
      return p;
    }));
  };

  const toggleProductMode = (product: CardProduct) => {
    const newMode = product.feesMode === 'AUTO' ? 'MANUAL' : 'AUTO';
    let updates: Partial<CardProduct> = { feesMode: newMode };

    // Nếu chuyển sang AUTO, tính toán lại giá trị theo Margin hiện tại của sản phẩm
    if (newMode === 'AUTO') {
        const margin = product.margin || 0; // Use existing margin
        if (type === 'EXCHANGE') {
            updates.exchangeRate = product.upstreamRate - margin;
        } else {
            updates.buyDiscount = product.upstreamDiscount - margin;
        }
    }

    setChanges(prev => ({
        ...prev,
        [product.id]: { id: product.id, ...updates, ...prev[product.id] }
    }));

    setLocalProducts(prev => prev.map(p => {
        if (p.id === product.id) {
            return { ...p, ...updates };
        }
        return p;
    }));
  };

  const handleSave = () => {
    if (onUpdate && Object.keys(changes).length > 0) {
       onUpdate(Object.values(changes));
    }
    setEditing(false);
    setChanges({});
  };

  const handleCancel = () => {
    setLocalProducts(products);
    setEditing(false);
    setChanges({});
  };

  // --- Configuration Logic (Bulk Update) ---

  const openConfigModal = (provider: CardProvider) => {
      // Find the first product to use as template
      const sampleProd = localProducts.find(p => p.providerCode === provider.code);
      setSelectedProviderConfig(provider);
      setTempConfig({
          mode: 'AUTO', // Default suggestion when bulk editing
          margin: sampleProd?.margin || 2.0
      });
      setConfigModalOpen(true);
  };

  const handleApplyConfig = () => {
      if (!selectedProviderConfig) return;

      // Apply to all products of this provider locally
      const updatedLocalProducts = localProducts.map(p => {
          if (p.providerCode === selectedProviderConfig.code) {
              let newVal = {};
              
              if (tempConfig.mode === 'AUTO') {
                  // Re-calculate value based on upstream
                  if (type === 'EXCHANGE') {
                      // Exchange Rate = Upstream Rate - Margin
                      const newRate = p.upstreamRate - tempConfig.margin;
                      newVal = { exchangeRate: newRate, margin: tempConfig.margin, feesMode: 'AUTO' };
                  } else {
                      // Buy Discount = Upstream Discount - Margin
                      const newDiscount = p.upstreamDiscount - tempConfig.margin;
                      newVal = { buyDiscount: newDiscount, margin: tempConfig.margin, feesMode: 'AUTO' };
                  }
              } else {
                  // Switch to Manual, keep values, just update mode
                   newVal = { feesMode: 'MANUAL' };
              }

              // Track change
              setChanges(prev => ({
                  ...prev,
                  [p.id]: { id: p.id, ...newVal }
              }));

              return { ...p, ...newVal };
          }
          return p;
      });

      setLocalProducts(updatedLocalProducts as CardProduct[]);
      setConfigModalOpen(false);
  };

  const formatDenom = (d: number) => {
      return d >= 1000000 ? (d/1000000) + 'Tr' : (d/1000) + 'k';
  };

  // --- Render: Admin Matrix ---
  const renderAdminMatrix = (provs: CardProvider[]) => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6 shadow-sm">
      <table className="w-full text-sm text-center border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
            <th className="p-3 border-r border-b border-gray-200 min-w-[150px] text-left sticky left-0 bg-gray-100 z-10">Nhà mạng</th>
            {DENOMINATIONS.map(d => (
              <th key={d} className="p-2 border-r border-b border-gray-200 min-w-[80px]">
                {formatDenom(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {provs.map(p => {
             // Check if all products for this provider are Auto to show badge
             const provProducts = localProducts.filter(prod => prod.providerCode === p.code);
             const allAuto = provProducts.length > 0 && provProducts.every(prod => prod.feesMode === 'AUTO');
             const someAuto = provProducts.some(prod => prod.feesMode === 'AUTO');

            return (
                <tr key={p.id} className="hover:bg-gray-50 group">
                <td className="p-3 border-r border-b border-gray-200 font-bold text-left text-gray-800 bg-white sticky left-0 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                            {p.name}
                            {allAuto ? (
                                <Badge variant="success" className="text-[9px] px-1 h-4">ALL AUTO</Badge>
                            ) : someAuto ? (
                                <Badge variant="warning" className="text-[9px] px-1 h-4">MIXED</Badge>
                            ) : (
                                <Badge variant="warning" className="text-[9px] px-1 h-4">MANUAL</Badge>
                            )}
                        </div>
                        <button 
                            onClick={() => openConfigModal(p)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Cấu hình hàng loạt (Batch Setting)"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </td>
                {DENOMINATIONS.map(denom => {
                    const product = getProduct(p.code, denom);
                    const isChanged = product && changes[product.id] !== undefined;
                    const val = getDisplayValue(product);
                    const isAuto = product?.feesMode === 'AUTO';
                    
                    return (
                    <td key={denom} className={`p-1 border-r border-b border-gray-200 relative ${isChanged ? 'bg-white z-20' : isAuto ? 'bg-blue-50/60' : 'bg-orange-50/60'}`}>
                         {/* Visual indicator for dirty/changed state */}
                         {isChanged && <div className="absolute inset-0 border-2 border-amber-400 pointer-events-none z-10"></div>}
                        
                        {product ? (
                            <div className="relative group/cell h-8 flex items-center justify-center">
                                <input 
                                    type="number"
                                    disabled={isAuto || !editing}
                                    className={`w-full text-center focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium h-full text-sm transition-colors ${
                                        isAuto 
                                            ? 'text-blue-700 bg-transparent cursor-not-allowed font-semibold' // AUTO STYLE
                                            : editing 
                                                ? 'text-orange-900 bg-transparent shadow-inner font-semibold' // MANUAL EDITING
                                                : 'text-orange-800 bg-transparent font-semibold' // MANUAL VIEW
                                    }`}
                                    value={val}
                                    onChange={(e) => handleInputChange(product.id, e.target.value)}
                                />
                                
                                {editing && (
                                    <button
                                        onClick={() => toggleProductMode(product)}
                                        className={`absolute right-0 top-0 bottom-0 px-1 opacity-0 group-hover/cell:opacity-100 transition-all z-10 flex items-center ${
                                            isAuto ? 'bg-blue-100 text-blue-600 hover:text-red-500' : 'bg-orange-100 text-orange-600 hover:text-blue-500'
                                        }`}
                                        title={isAuto ? "Đang chạy Auto (Click để sửa tay)" : "Đang chỉnh tay (Click để Auto)"}
                                    >
                                        {isAuto ? <Lock size={10} /> : <Unlock size={10} />}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-300 text-xs">-</span>
                        )}
                    </td>
                    );
                })}
                </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // --- Render: User Matrix (No changes) ---
  const renderUserView = () => {
    const currentProvider = categoryProviders.find(p => p.id === activeProviderId);

    return (
      <div className="bg-white">
        <div className="flex border-b border-gray-100">
           <button 
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeCategory === 'TELCO' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             onClick={() => setActiveCategory('TELCO')}
           >
             THẺ ĐIỆN THOẠI
           </button>
           <button 
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeCategory === 'GAME' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             onClick={() => setActiveCategory('GAME')}
           >
             THẺ GAME
           </button>
        </div>

        <div className="block md:hidden p-4">
           {categoryProviders.length === 0 ? (
               <div className="text-center text-gray-400 text-sm py-4">Chưa có dữ liệu</div>
           ) : (
               <>
                 <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar mb-2">
                    {categoryProviders.map(p => {
                        const isActive = p.id === activeProviderId;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setActiveProviderId(p.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                    isActive 
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {p.name}
                            </button>
                        )
                    })}
                 </div>
                 {currentProvider && (
                    <div className="animate-in fade-in duration-300">
                        <div className="grid grid-cols-3 gap-3">
                           {DENOMINATIONS.map(d => {
                               const product = getProduct(currentProvider.code, d);
                               const val = getDisplayValue(product);
                               return (
                                   <div key={d} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                                       type === 'EXCHANGE' ? 'bg-gray-50 border-gray-100' : 'bg-primary-50/20 border-primary-100'
                                   }`}>
                                       <span className="text-xs text-gray-400 font-medium mb-1">{formatDenom(d)}</span>
                                       {product ? (
                                           <span className={`text-lg font-bold leading-none ${type === 'EXCHANGE' ? 'text-gray-900' : 'text-primary-600'}`}>
                                               {val}%
                                           </span>
                                       ) : (
                                           <span className="text-gray-300 font-bold">-</span>
                                       )}
                                   </div>
                               )
                           })}
                        </div>
                    </div>
                 )}
               </>
           )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[350px]">
            <thead>
               <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="p-3 border-r border-gray-200 text-left w-[140px] sticky left-0 bg-gray-50 z-10 font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Nhà mạng
                  </th>
                  {DENOMINATIONS.map((d) => (
                    <th key={d} className="p-2 border-r border-gray-200 min-w-[70px] font-semibold text-center whitespace-nowrap">
                       {formatDenom(d)}
                    </th>
                  ))}
               </tr>
            </thead>
            <tbody>
              {categoryProviders.map((p, idx) => (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                   <td className="p-3 border-r border-b border-gray-200 font-bold text-gray-800 sticky left-0 z-10 text-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-inherit">
                      {p.name}
                   </td>
                   {DENOMINATIONS.map((d) => {
                      const product = getProduct(p.code, d);
                      const val = getDisplayValue(product);
                      return (
                         <td key={d} className="p-2 border-r border-b border-gray-200 text-center">
                            {product ? (
                               <span className={`font-bold text-sm ${type === 'EXCHANGE' ? 'text-gray-700' : 'text-primary-600'}`}>
                                  {val}%
                               </span>
                            ) : (
                               <span className="text-gray-300">-</span>
                            )}
                         </td>
                      )
                   })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
        <Card className="mb-8" noPadding>
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                {title}
                {isEditable && editing && <Badge variant="warning">Đang chỉnh sửa</Badge>}
                </h3>
                {isEditable && (
                <div className="flex gap-2">
                    {editing ? (
                    <>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="text-gray-500 border-gray-200 h-8">
                        Hủy
                        </Button>
                        <Button size="sm" onClick={handleSave} className="h-8">
                        <Save size={14} className="mr-1" /> Lưu thay đổi
                        </Button>
                    </>
                    ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 border-gray-200">
                        <Edit2 size={14} className="mr-1" /> Sửa phí
                    </Button>
                    )}
                </div>
                )}
            </div>
            
            <div className="p-0">
                {(editing || isEditable) ? (
                    <div className="p-4 bg-white">
                        <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg text-xs mb-4">
                            <div className="flex items-start gap-2 mb-2">
                                <Info size={16} className="shrink-0 mt-0.5"/>
                                <p>
                                    <strong>Hướng dẫn:</strong><br/>
                                    - Click vào ô giá trị để sửa. Click icon <Lock size={10} className="inline"/> / <Unlock size={10} className="inline"/> để chuyển chế độ.<br/>
                                    - <Settings size={12} className="inline"/> cạnh tên nhà mạng để cấu hình hàng loạt.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 border-t border-blue-100 pt-2 pl-6">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm inline-block"></span>
                                    <span className="text-blue-700 font-semibold">Auto (Tự động)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-sm inline-block"></span>
                                    <span className="text-orange-700 font-semibold">Manual (Thủ công)</span>
                                </div>
                            </div>
                        </div>
                        
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Thẻ điện thoại</h4>
                        {renderAdminMatrix(telcoProviders)}
                        
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Thẻ Game</h4>
                        {renderAdminMatrix(gameProviders)}
                    </div>
                ) : (
                    renderUserView()
                )}
            </div>
        </Card>

        {/* Configuration Modal */}
        <Modal 
            isOpen={configModalOpen}
            onClose={() => setConfigModalOpen(false)}
            title={`Cấu hình hàng loạt: ${selectedProviderConfig?.name}`}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setConfigModalOpen(false)}>Hủy</Button>
                    <Button onClick={handleApplyConfig}>Áp dụng cho tất cả mệnh giá</Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex gap-2 text-yellow-800 text-sm">
                   <AlertCircle size={16} className="shrink-0 mt-0.5" />
                   <p>Thao tác này sẽ áp dụng chế độ và biên lợi nhuận cho <strong>tất cả mệnh giá</strong> của {selectedProviderConfig?.name}.</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chế độ cập nhật giá</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                tempConfig.mode === 'AUTO' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                            onClick={() => setTempConfig(prev => ({...prev, mode: 'AUTO'}))}
                        >
                            <RefreshCw size={24} className="mb-2" />
                            <span className="text-sm font-bold">Tự động (Auto)</span>
                            <span className="text-[10px] opacity-70 mt-1">Theo API nhà cung cấp</span>
                        </button>
                        <button 
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                tempConfig.mode === 'MANUAL' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                            onClick={() => setTempConfig(prev => ({...prev, mode: 'MANUAL'}))}
                        >
                            <Edit2 size={24} className="mb-2" />
                            <span className="text-sm font-bold">Thủ công</span>
                            <span className="text-[10px] opacity-70 mt-1">Tự nhập tay từng ô</span>
                        </button>
                    </div>
                </div>

                {tempConfig.mode === 'AUTO' && (
                    <div className="animate-in slide-in-from-top-2">
                        <Input 
                            label="Biên lợi nhuận mong muốn (%)"
                            type="number"
                            value={tempConfig.margin}
                            onChange={(e) => setTempConfig(prev => ({...prev, margin: parseFloat(e.target.value) || 0}))}
                            placeholder="VD: 2.0"
                            icon={<Zap size={16} />}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {type === 'EXCHANGE' 
                                ? "Công thức: Phí hiển thị = (Phí gốc từ NCC) + Margin"
                                : "Công thức: Chiết khấu bán = (Chiết khấu gốc từ NCC) - Margin"
                            }
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    </>
  );
};