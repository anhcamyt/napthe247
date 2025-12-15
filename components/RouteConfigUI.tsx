import React, { useState, useEffect } from 'react';
import { CardProduct, CardProvider, ApiConnection, ApiConnectionType } from '../types';
import { Card, Button, Modal, Badge } from './UIComponents';
import { Settings, Save, Edit2, AlertCircle } from 'lucide-react';

interface RouteMatrixProps {
  title: string;
  type: 'EXCHANGE' | 'SHOP';
  providers: CardProvider[];
  products: CardProduct[];
  connections: ApiConnection[];
  onUpdate: (updates: Partial<CardProduct>[]) => void;
}

const DENOMINATIONS = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000];

export const RouteMatrix: React.FC<RouteMatrixProps> = ({ 
  title, 
  type, 
  providers, 
  products, 
  connections, 
  onUpdate 
}) => {
  const [changes, setChanges] = useState<{ [key: string]: Partial<CardProduct> }>({});
  const [localProducts, setLocalProducts] = useState<CardProduct[]>(products);
  const [editing, setEditing] = useState(false);
  
  // Config Modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedProviderConfig, setSelectedProviderConfig] = useState<CardProvider | null>(null);
  const [targetConnectionId, setTargetConnectionId] = useState('');

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const relevantConnections = connections.filter(c => 
      type === 'EXCHANGE' ? c.type === ApiConnectionType.EXCHANGE : c.type === ApiConnectionType.STORE
  );

  const getProduct = (providerCode: string, value: number) => {
    return localProducts.find(p => p.providerCode === providerCode && p.value === value);
  };

  const getConnectionId = (product: CardProduct | undefined) => {
      if (!product) return undefined;
      return type === 'EXCHANGE' ? product.exchangeConnectionId : product.storeConnectionId;
  };

  const handleSelectChange = (productId: string, connId: string) => {
      const field = type === 'EXCHANGE' ? 'exchangeConnectionId' : 'storeConnectionId';
      
      setChanges(prev => ({
          ...prev,
          [productId]: { id: productId, [field]: connId }
      }));

      setLocalProducts(prev => prev.map(p => p.id === productId ? { ...p, [field]: connId } : p));
  };

  const handleApplyConfig = () => {
      if (!selectedProviderConfig || !targetConnectionId) return;
      
      const field = type === 'EXCHANGE' ? 'exchangeConnectionId' : 'storeConnectionId';
      
      const updatedProds = localProducts.map(p => {
          if (p.providerCode === selectedProviderConfig.code) {
              setChanges(prev => ({
                  ...prev,
                  [p.id]: { id: p.id, [field]: targetConnectionId }
              }));
              return { ...p, [field]: targetConnectionId };
          }
          return p;
      });
      
      setLocalProducts(updatedProds);
      setConfigModalOpen(false);
  };

  const handleSave = () => {
      if (onUpdate) onUpdate(Object.values(changes));
      setEditing(false);
      setChanges({});
  };

  const handleCancel = () => {
      setLocalProducts(products);
      setEditing(false);
      setChanges({});
  };

  const openConfigModal = (p: CardProvider) => {
      setSelectedProviderConfig(p);
      setTargetConnectionId('');
      setConfigModalOpen(true);
  }

  const formatDenom = (d: number) => d >= 1000000 ? (d/1000000) + 'Tr' : (d/1000) + 'k';

  return (
    <>
      <Card className="mb-8" noPadding>
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                {title}
                {editing && <Badge variant="warning">Đang chỉnh sửa</Badge>}
            </h3>
            <div className="flex gap-2">
                {editing ? (
                    <>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">Hủy</Button>
                        <Button size="sm" onClick={handleSave} className="h-8"><Save size={14} className="mr-1"/> Lưu</Button>
                    </>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8"><Edit2 size={14} className="mr-1"/> Sửa luồng</Button>
                )}
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-center border-collapse min-w-[900px]">
                <thead>
                    <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                        <th className="p-3 border-r border-b border-gray-200 min-w-[150px] text-left sticky left-0 bg-gray-100 z-10">Nhà mạng</th>
                        {DENOMINATIONS.map(d => (
                            <th key={d} className="p-2 border-r border-b border-gray-200 min-w-[100px]">{formatDenom(d)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {providers.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 group">
                            <td className="p-3 border-r border-b border-gray-200 font-bold text-left text-gray-800 bg-white sticky left-0 z-10">
                                <div className="flex justify-between items-center">
                                    <span>{p.name}</span>
                                    {editing && (
                                        <button onClick={() => openConfigModal(p)} className="p-1 rounded hover:bg-gray-200 text-gray-500">
                                            <Settings size={14}/>
                                        </button>
                                    )}
                                </div>
                            </td>
                            {DENOMINATIONS.map(d => {
                                const product = getProduct(p.code, d);
                                const connId = getConnectionId(product);
                                const isChanged = product && changes[product.id] !== undefined;
                                const connName = relevantConnections.find(c => c.id === connId)?.name || (connId ? 'Unknown' : '-');

                                return (
                                    <td key={d} className={`p-1 border-r border-b border-gray-200 relative ${isChanged ? 'bg-yellow-50' : ''}`}>
                                        {product ? (
                                            editing ? (
                                                <select 
                                                    className={`w-full text-xs p-1 border-none focus:ring-0 bg-transparent ${!connId ? 'text-red-500' : ''}`}
                                                    value={connId || ''}
                                                    onChange={(e) => handleSelectChange(product.id, e.target.value)}
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {relevantConnections.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`text-xs ${!connId ? 'text-red-300' : 'text-gray-600'}`}>
                                                    {connName}
                                                </span>
                                            )
                                        ) : <span className="text-gray-200">-</span>}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal 
        isOpen={configModalOpen} 
        onClose={() => setConfigModalOpen(false)} 
        title={`Cấu hình nhanh: ${selectedProviderConfig?.name}`}
        footer={
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfigModalOpen(false)}>Hủy</Button>
                <Button onClick={handleApplyConfig}>Áp dụng</Button>
            </div>
        }
      >
        <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                <p>Chọn kênh kết nối cho tất cả mệnh giá của <strong>{selectedProviderConfig?.name}</strong>.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kênh kết nối</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={targetConnectionId}
                    onChange={(e) => setTargetConnectionId(e.target.value)}
                >
                    <option value="">-- Chọn kênh --</option>
                    {relevantConnections.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </Modal>
    </>
  );
};