import React, { useMemo, useState } from 'react';
import { Prescription, InventoryItem, Patient, PrescriptionStatus } from '../../types';
import Card from '../common/Card';
import { IndianRupee, ShoppingBag, Search, FileText } from 'lucide-react';

interface PharmacySalesProps {
    prescriptions: Prescription[];
    inventory: InventoryItem[];
    patients: Patient[];
}

const PharmacySales: React.FC<PharmacySalesProps> = ({ prescriptions, inventory, patients }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const salesData = useMemo(() => {
        return prescriptions
            .filter(p => p.status === PrescriptionStatus.Fulfilled)
            .map(p => {
                const itemDetails = inventory.find(i => i.name.toLowerCase() === p.medicineName.toLowerCase());
                const patientName = patients.find(pat => pat.id === p.patientId)?.name || 'N/A';
                const total = p.totalAmount || (itemDetails?.price || 0) * p.quantity;
                return {
                    ...p,
                    patientName,
                    price: itemDetails?.price || 0,
                    total
                };
            })
            .sort((a, b) => new Date(b.dateFulfilled!).getTime() - new Date(a.dateFulfilled!).getTime());
    }, [prescriptions, inventory, patients]);
    
    const filteredSales = useMemo(() =>
        salesData.filter(sale =>
            sale.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [salesData, searchTerm]
    );

    const stats = useMemo(() => {
        const totalRevenue = salesData.reduce((acc, sale) => acc + sale.total, 0);
        const today = new Date().toISOString().split('T')[0];
        const todaysRevenue = salesData
            .filter(sale => sale.dateFulfilled === today)
            .reduce((acc, sale) => acc + sale.total, 0);
        return { totalRevenue, todaysRevenue };
    }, [salesData]);

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon="IndianRupee" color="green" />
                <Card title="Today's Revenue" value={`₹${stats.todaysRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon="ShoppingBag" color="blue" />
                <Card title="Total Prescriptions Fulfilled" value={salesData.length.toString()} icon="FileText" color="violet" />
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="font-heading text-xl font-semibold text-slate-700">Sales Log</h3>
                    <div className="relative w-full sm:w-auto sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search patient or medicine..."
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date Fulfilled</th>
                                <th scope="col" className="px-6 py-3">Patient</th>
                                <th scope="col" className="px-6 py-3">Medicine</th>
                                <th scope="col" className="px-6 py-3">Qty</th>
                                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Price</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4">{sale.dateFulfilled}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{sale.patientName}</td>
                                    <td className="px-6 py-4">{sale.medicineName}</td>
                                    <td className="px-6 py-4">{sale.quantity}</td>
                                    <td className="px-6 py-4 hidden sm:table-cell">₹{sale.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-semibold">₹{sale.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredSales.length === 0 && (
                    <p className="text-center text-slate-500 py-12">No sales data found.</p>
                )}
            </div>
        </div>
    );
};

export default PharmacySales;
