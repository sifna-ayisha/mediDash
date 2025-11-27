import React, { useState, useMemo } from 'react';
import { Prescription, Patient, Doctor, InventoryItem, PrescriptionStatus, NotificationType, StockStatus, PaymentStatus } from '../../types';
import { FilePlus, Search, CheckCircle } from 'lucide-react';

const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return StockStatus.OutOfStock;
    if (stock < 50) return StockStatus.LowStock;
    return StockStatus.InStock;
};

interface PharmacyPrescriptionsProps {
    prescriptions: Prescription[];
    setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    patients: Patient[];
    doctors: Doctor[];
    addNotification: (type: NotificationType, message: string, linkTo: string) => void;
}

const getStatusColor = (status: PrescriptionStatus) => {
    switch(status) {
        case PrescriptionStatus.Issued: return 'bg-blue-100 text-blue-800';
        case PrescriptionStatus.Fulfilled: return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const PharmacyPrescriptions: React.FC<PharmacyPrescriptionsProps> = ({ prescriptions, setPrescriptions, inventory, setInventory, patients, doctors, addNotification }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const prescriptionsWithDetails = useMemo(() => {
        return prescriptions.map(p => ({
            ...p,
            patientName: patients.find(pat => pat.id === p.patientId)?.name || 'N/A',
            doctorName: doctors.find(doc => doc.id === p.doctorId)?.name || 'N/A',
        })).sort((a, b) => {
            if (a.status === b.status) return new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime();
            return a.status === PrescriptionStatus.Issued ? -1 : 1;
        });
    }, [prescriptions, patients, doctors]);

    const filteredPrescriptions = useMemo(() => 
        prescriptionsWithDetails.filter(p => 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [prescriptionsWithDetails, searchTerm]);
    
    const handleFulfill = (prescription: Prescription) => {
        const medicineItem = inventory.find(i => i.name.toLowerCase() === prescription.medicineName.toLowerCase());

        if (!medicineItem) {
            alert(`Error: Medicine "${prescription.medicineName}" not found in inventory.`);
            return;
        }

        if (medicineItem.stock < prescription.quantity) {
            alert(`Error: Not enough stock for ${prescription.medicineName}. Required: ${prescription.quantity}, Available: ${medicineItem.stock}`);
            return;
        }

        const totalAmount = medicineItem.price * prescription.quantity;

        // Fulfill prescription
        setInventory(prevInventory => {
            const newStock = medicineItem.stock - prescription.quantity;
            
            // Check for low stock notification
            const currentStatus = getStockStatus(newStock);
            const previousStatus = getStockStatus(medicineItem.stock);
            if (currentStatus === StockStatus.LowStock && previousStatus !== StockStatus.LowStock) {
                addNotification(NotificationType.LowStock, `${medicineItem.name} is now low on stock (${newStock} units left).`, 'Reorder');
            }

            return prevInventory.map(item => 
                item.id === medicineItem.id ? { ...item, stock: newStock } : item
            );
        });

        setPrescriptions(prevPrescriptions => 
            prevPrescriptions.map(p => 
                p.id === prescription.id ? { 
                    ...p, 
                    status: PrescriptionStatus.Fulfilled, 
                    dateFulfilled: new Date().toISOString().split('T')[0],
                    totalAmount: totalAmount,
                    paymentStatus: PaymentStatus.Unpaid
                } : p
            )
        );

        alert(`${prescription.medicineName} (${prescription.quantity} units) fulfilled for ${patients.find(p => p.id === prescription.patientId)?.name}. Bill generated.`);
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="font-heading text-xl font-semibold text-gray-700 flex items-center">
                    <FilePlus className="mr-3 text-primary" />
                    Manage Prescriptions
                </h3>
                 <div className="relative mt-4 md:mt-0 w-full md:w-auto md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search patient or medicine..." 
                        className="pl-10 pr-4 py-2 border rounded-xl w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Patient</th>
                            <th scope="col" className="px-6 py-3">Doctor</th>
                            <th scope="col" className="px-6 py-3">Medicine</th>
                            <th scope="col" className="px-6 py-3">Quantity</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPrescriptions.map((presc) => (
                            <tr key={presc.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{presc.dateIssued}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{presc.patientName}</td>
                                <td className="px-6 py-4">{presc.doctorName}</td>
                                <td className="px-6 py-4">{presc.medicineName}</td>
                                <td className="px-6 py-4 font-semibold">{presc.quantity}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(presc.status)}`}>
                                        {presc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {presc.status === PrescriptionStatus.Issued && (
                                        <button 
                                            onClick={() => handleFulfill(presc)}
                                            className="flex items-center justify-center w-full px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-semibold"
                                        >
                                            <CheckCircle size={14} className="mr-1" />
                                            Fulfill
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredPrescriptions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No prescriptions found.</p>
            )}
        </div>
    );
};

export default PharmacyPrescriptions;