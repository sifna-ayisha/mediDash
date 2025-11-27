import React, { useMemo } from 'react';
import { InventoryItem, StockStatus } from '../../types';
import { Repeat, AlertTriangle, Archive } from 'lucide-react';

const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return StockStatus.OutOfStock;
    if (stock < 50) return StockStatus.LowStock;
    return StockStatus.InStock;
};

const getStockStatusColor = (status: StockStatus) => {
    switch(status) {
        case StockStatus.LowStock: return 'bg-yellow-100 text-yellow-800';
        case StockStatus.OutOfStock: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

interface PharmacyReorderProps {
    inventory: InventoryItem[];
}

const PharmacyReorder: React.FC<PharmacyReorderProps> = ({ inventory }) => {
    const reorderList = useMemo(() => {
        return inventory
            .filter(item => {
                const status = getStockStatus(item.stock);
                return status === StockStatus.LowStock || status === StockStatus.OutOfStock;
            })
            .sort((a, b) => a.stock - b.stock); // Show out of stock items first
    }, [inventory]);

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="font-heading text-xl font-semibold text-gray-700 flex items-center">
                    <Repeat className="mr-3 text-primary" />
                    Reorder List
                </h3>
                <p className="text-sm text-gray-500 mt-2 md:mt-0">
                    Showing all items with low or zero stock.
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Medicine Name</th>
                            <th scope="col" className="px-6 py-3">Current Stock</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reorderList.map(item => {
                            const status = getStockStatus(item.stock);
                            return (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 font-semibold">{item.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit ${getStockStatusColor(status)}`}>
                                            {status === StockStatus.LowStock ? <AlertTriangle size={14} className="mr-1.5" /> : <Archive size={14} className="mr-1.5" />}
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{item.supplier}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {reorderList.length === 0 && (
                <p className="text-center text-gray-500 py-12">
                    All items are sufficiently stocked.
                </p>
            )}
        </div>
    );
};

export default PharmacyReorder;