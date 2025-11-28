import React, { useMemo } from 'react';
import { Pill, AlertTriangle, FilePlus, IndianRupee } from 'lucide-react';
// FIX: Add CartesianGrid to recharts import
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Card from '../common/Card';
import { Prescription, InventoryItem, Patient, Doctor, StockStatus, NotificationType, PrescriptionStatus, PaymentStatus, ClinicSettings } from '../../types';
import PharmacyPrescriptions from '../pharmacy/PharmacyPrescriptions';
import PharmacyInventory from '../pharmacy/PharmacyInventory';
import PharmacySales from '../pharmacy/PharmacySales';
import PharmacyReorder from '../pharmacy/PharmacyReorder';
import PharmacyBilling from '../pharmacy/PharmacyBilling';

const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return StockStatus.OutOfStock;
    if (stock < 50) return StockStatus.LowStock;
    return StockStatus.InStock;
};

interface PharmacyDashboardProps {
    activeView: string;
    prescriptions: Prescription[];
    setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    patients: Patient[];
    doctors: Doctor[];
    addNotification: (type: NotificationType, message: string, linkTo: string) => void;
    clinicSettings: ClinicSettings;
}

const PharmacyDashboard: React.FC<PharmacyDashboardProps> = (props) => {
    const { 
        activeView, 
        prescriptions,
        inventory,
    } = props;

    const stats = useMemo(() => {
        const lowStockCount = inventory.filter(item => getStockStatus(item.stock) === StockStatus.LowStock).length;
        const pendingPrescriptions = prescriptions.filter(p => p.status === PrescriptionStatus.Issued).length;
        const today = new Date().toISOString().split('T')[0];
        
        const todaysSales = prescriptions
            .filter(p => p.status === PrescriptionStatus.Fulfilled && p.dateFulfilled === today && p.paymentStatus === PaymentStatus.Paid)
            .reduce((total, p) => total + (p.totalAmount || 0), 0);

        return { lowStockCount, pendingPrescriptions, todaysSales };
    }, [inventory, prescriptions]);

    const lowStockData = useMemo(() => {
        return inventory
            .filter(item => getStockStatus(item.stock) !== StockStatus.InStock)
            .sort((a,b) => a.stock - b.stock)
            .slice(0, 5);
    }, [inventory]);

    const DashboardView = () => (
        <div className="space-y-6 md:space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card title="Medicine Types" value={inventory.length.toString()} icon="Pill" color="blue" />
                <Card title="Low Stock Items" value={stats.lowStockCount.toString()} icon="AlertTriangle" color="red" />
                <Card title="Pending Prescriptions" value={stats.pendingPrescriptions.toString()} icon="FilePlus" color="amber" />
                <Card title="Today's Sales" value={`₹${stats.todaysSales.toLocaleString('en-IN')}`} icon="IndianRupee" color="green" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                <div className="xl:col-span-2">
                    <PharmacyPrescriptions {...props} />
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                    <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Low Stock Items</h3>
                    {lowStockData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={lowStockData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    width={80} 
                                    tick={{fontSize: 12}} 
                                    tickLine={false} 
                                    axisLine={false}
                                    stroke="#64748b"
                                />
                                <Tooltip
                                    cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} 
                                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}} 
                                />
                                <Bar dataKey="stock" barSize={20}>
                                    {lowStockData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.stock < 50 && entry.stock > 0 ? '#f59e0b' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-slate-500 text-center">All items are sufficiently stocked.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard':
                 return <DashboardView />;
            case 'Prescriptions':
                return <PharmacyPrescriptions {...props} />;
            case 'Inventory':
                return <PharmacyInventory inventory={props.inventory} setInventory={props.setInventory} addNotification={props.addNotification} />;
            case 'Sales':
                return <PharmacySales prescriptions={props.prescriptions} inventory={props.inventory} patients={props.patients} />;
            case 'Billing':
                return <PharmacyBilling 
                    prescriptions={props.prescriptions} 
                    setPrescriptions={props.setPrescriptions} 
                    inventory={props.inventory}
                    setInventory={props.setInventory}
                    patients={props.patients}
                    doctors={props.doctors}
                    clinicSettings={props.clinicSettings}
                    addNotification={props.addNotification}
                />;
             case 'Reorder':
                return <PharmacyReorder inventory={props.inventory} />;
            default:
                return <DashboardView />;
        }
    }

    return (
        <div className="space-y-6 md:space-y-8">
           {renderContent()}
        </div>
    );
};

export default PharmacyDashboard;