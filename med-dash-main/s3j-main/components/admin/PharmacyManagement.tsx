import React, { useState, useMemo } from 'react';
import { InventoryItem, StockStatus, NotificationType } from '../../types';
import { Plus, Search, Edit, Trash2, Pill, AlertTriangle, Archive, IndianRupee } from 'lucide-react';
import Modal from '../common/Modal';
import Card from '../common/Card';

// Helper function to determine stock status
const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return StockStatus.OutOfStock;
    if (stock < 50) return StockStatus.LowStock;
    return StockStatus.InStock;
};

// Helper function for status color
const getStockStatusColor = (status: StockStatus) => {
    switch(status) {
        case StockStatus.InStock: return 'bg-green-100 text-green-800';
        case StockStatus.LowStock: return 'bg-amber-100 text-amber-800';
        case StockStatus.OutOfStock: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

interface PharmacyManagementProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    addNotification: (type: NotificationType, message: string, linkTo: string) => void;
}

const MedicineForm: React.FC<{ item?: InventoryItem | null; onSave: (item: InventoryItem) => void; onCancel: () => void }> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState<InventoryItem>(item || { id: '', name: '', stock: 0, supplier: '', price: 0, expiryDate: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['stock', 'price'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || `M${Date.now()}` });
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Medicine Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Supplier</label>
                    <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Stock</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={commonInputClass} required min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Price (per unit)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className={commonInputClass} required min="0" step="0.01" />
                </div>
                 <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={commonInputClass} required />
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Medicine</button>
            </div>
        </form>
    );
}

const PharmacyManagement: React.FC<PharmacyManagementProps> = ({ inventory, setInventory, addNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (item: InventoryItem) => {
        const previousStock = inventory.find(i => i.id === item.id)?.stock;
    
        if (editingItem) {
            setInventory(inventory.map(i => i.id === item.id ? item : i));
        } else {
            setInventory([...inventory, item]);
        }
    
        const currentStatus = getStockStatus(item.stock);
        const previousStatus = typeof previousStock !== 'undefined' ? getStockStatus(previousStock) : null;
    
        if (currentStatus === StockStatus.LowStock && previousStatus !== StockStatus.LowStock) {
            addNotification(NotificationType.LowStock, `${item.name} is low on stock (${item.stock} units left).`, 'Pharmacy');
        }
        
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this medicine from the inventory?')) {
            setInventory(inventory.filter(i => i.id !== id));
        }
    };

    const filteredInventory = useMemo(() => 
        inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        ), [inventory, searchTerm]);
        
    const stats = useMemo(() => {
        const lowStockCount = inventory.filter(item => getStockStatus(item.stock) === StockStatus.LowStock).length;
        const outOfStockCount = inventory.filter(item => getStockStatus(item.stock) === StockStatus.OutOfStock).length;
        const totalValue = inventory.reduce((acc, item) => acc + (item.stock * item.price), 0);
        return { lowStockCount, outOfStockCount, totalValue };
    }, [inventory]);

    return (
        <div className="space-y-6 md:space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card title="Medicine Types" value={inventory.length.toString()} icon="Pill" color="blue" />
                <Card title="Low Stock Items" value={stats.lowStockCount.toString()} icon="AlertTriangle" color="amber" />
                <Card title="Out of Stock Items" value={stats.outOfStockCount.toString()} icon="Archive" color="red" />
                <Card title="Inventory Value" value={`₹${stats.totalValue.toLocaleString('en-IN')}`} icon="IndianRupee" color="green" />
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="font-heading text-xl font-semibold text-slate-700">Medicine Inventory</h3>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search medicine..." 
                                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                            <Plus size={16} className="mr-2" />
                            <span>Add New</span>
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 hidden md:table-cell">Supplier</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3 hidden lg:table-cell">Expiry Date</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map(item => {
                                const status = getStockStatus(item.stock);
                                return (
                                    <tr key={item.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                        <td className="px-6 py-4 font-semibold">{item.stock}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">{item.supplier}</td>
                                        <td className="px-6 py-4">₹{item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 hidden lg:table-cell">{item.expiryDate}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center">
                                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Medicine' : 'Add New Medicine'}>
                    <MedicineForm item={editingItem} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingItem(null); }} />
                </Modal>
            </div>
        </div>
    );
};

export default PharmacyManagement;
