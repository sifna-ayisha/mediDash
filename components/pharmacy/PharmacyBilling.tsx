import React, { useState, useMemo, useEffect } from 'react';
import { Prescription, Patient, InventoryItem, PrescriptionStatus, PaymentStatus, Doctor, ClinicSettings, StockStatus, NotificationType } from '../../types';
import { IndianRupee, Search, Wallet, FileCheck, CircleDollarSign, Download, Plus, MessageSquare } from 'lucide-react';
import Card from '../common/Card';
import PharmacyInvoice from './PharmacyInvoice';
import Modal from '../common/Modal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PharmacyBillingProps {
    prescriptions: Prescription[];
    setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    patients: Patient[];
    doctors: Doctor[];
    clinicSettings: ClinicSettings;
    addNotification: (type: NotificationType, message: string, linkTo: string) => void;
}

const getPaymentStatusColor = (status?: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-100 text-green-800';
        case PaymentStatus.Unpaid: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return StockStatus.OutOfStock;
    if (stock < 50) return StockStatus.LowStock;
    return StockStatus.InStock;
};

const PharmacyBilling: React.FC<PharmacyBillingProps> = ({ prescriptions, setPrescriptions, inventory, setInventory, patients, doctors, clinicSettings, addNotification }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pdfData, setPdfData] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBillData, setNewBillData] = useState({ patientId: '', medicineName: '', quantity: 1, markAsPaid: false });

     useEffect(() => {
        if (pdfData) {
            const ticketElement = document.getElementById('print-area');
            if (ticketElement) {
                setTimeout(() => {
                    html2canvas(ticketElement, { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                        const margin = 15;
                        const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        
                        pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
                        pdf.save(`Invoice-Pharmacy-${pdfData.prescription.id}.pdf`);
                    }).catch(error => {
                        console.error("Error generating PDF:", error);
                    }).finally(() => {
                        setPdfData(null);
                    });
                }, 100);
            } else {
                setPdfData(null);
            }
        }
    }, [pdfData]);

    const fulfilledPrescriptions = useMemo(() => {
        return prescriptions
            .filter(p => p.status === PrescriptionStatus.Fulfilled)
            .map(report => {
                const patient = patients.find(p => p.id === report.patientId);
                return {
                    ...report,
                    patientName: patient?.name || 'N/A',
                    whatsappNumber: patient?.whatsappNumber,
                }
            })
            .sort((a, b) => new Date(b.dateFulfilled!).getTime() - new Date(a.dateFulfilled!).getTime());
    }, [prescriptions, patients]);

    const stats = useMemo(() => {
        const totalBilled = fulfilledPrescriptions.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalCollected = fulfilledPrescriptions
            .filter(p => p.paymentStatus === PaymentStatus.Paid)
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const outstandingBills = fulfilledPrescriptions.filter(p => p.paymentStatus === PaymentStatus.Unpaid).length;
        
        return { totalBilled, totalCollected, outstandingBills };
    }, [fulfilledPrescriptions]);
    
    const filteredBills = useMemo(() => 
        fulfilledPrescriptions.filter(p => 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        ), [fulfilledPrescriptions, searchTerm]);
        
    const handleMarkAsPaid = (prescriptionId: string) => {
        setPrescriptions(prev => 
            prev.map(p => p.id === prescriptionId ? { ...p, paymentStatus: PaymentStatus.Paid } : p)
        );
    };

    const handleDownloadInvoice = (prescription: Prescription) => {
        const patient = patients.find(p => p.id === prescription.patientId);
        const doctor = doctors.find(d => d.id === prescription.doctorId);
        if (patient && doctor) {
            setPdfData({ prescription, patient, doctor, clinicSettings });
        } else if (patient) {
            // Handle OTC sales where doctor might be a placeholder
            const otcDoctor: Doctor = { id: 'doc-otc', name: 'Pharmacy (OTC)', specialty: 'Pharmacy', email: '', phone: '' };
            setPdfData({ prescription, patient, doctor: otcDoctor, clinicSettings });
        }
    };

    const handleCreateBillSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { patientId, medicineName, quantity, markAsPaid } = newBillData;

        if (!patientId || !medicineName || quantity <= 0) {
            alert('Please fill out all fields correctly.');
            return;
        }

        const medicineItem = inventory.find(i => i.name === medicineName);
        if (!medicineItem) {
            alert('Selected medicine not found in inventory.');
            return;
        }
        if (medicineItem.stock < quantity) {
            alert(`Not enough stock for ${medicineName}. Available: ${medicineItem.stock}`);
            return;
        }

        const newBill: Prescription = {
            id: `presc${Date.now()}`,
            patientId,
            doctorId: 'doc-otc', // Placeholder for Over-The-Counter sales
            medicineName,
            dosage: 'As directed',
            quantity,
            frequency: 'OTC',
            dateIssued: new Date().toISOString().split('T')[0],
            status: PrescriptionStatus.Fulfilled,
            dateFulfilled: new Date().toISOString().split('T')[0],
            totalAmount: medicineItem.price * quantity,
            paymentStatus: markAsPaid ? PaymentStatus.Paid : PaymentStatus.Unpaid,
        };

        // Update inventory
        const newStock = medicineItem.stock - quantity;
        setInventory(prev => prev.map(item => item.id === medicineItem.id ? { ...item, stock: newStock } : item));
        
        // Check for low stock notification
        if (getStockStatus(newStock) === StockStatus.LowStock && getStockStatus(medicineItem.stock) !== StockStatus.LowStock) {
            addNotification(NotificationType.LowStock, `${medicineName} is low on stock (${newStock} left).`, 'Reorder');
        }

        // Add the new bill
        setPrescriptions(prev => [newBill, ...prev]);

        // Reset and close
        setIsCreateModalOpen(false);
        setNewBillData({ patientId: '', medicineName: '', quantity: 1, markAsPaid: false });
        alert(markAsPaid ? 'Bill created and marked as paid successfully!' : 'Unpaid bill created successfully!');
    };

    const handleNewBillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setNewBillData(prev => ({...prev, [name]: type === 'checkbox' ? checked : (name === 'quantity' ? parseInt(value) || 0 : value)}));
    };

    return (
        <>
            <div className="fixed left-[-2000px] top-0 z-[-1]">
                {pdfData && <PharmacyInvoice {...pdfData} />}
            </div>
            <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <Card title="Total Billed" value={`₹${stats.totalBilled.toLocaleString('en-IN')}`} icon="IndianRupee" color="blue" />
                    <Card title="Total Collected" value={`₹${stats.totalCollected.toLocaleString('en-IN')}`} icon="FileCheck" color="green" />
                    <Card title="Outstanding Bills" value={stats.outstandingBills.toString()} icon="Wallet" color="red" />
                </div>
                
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="font-heading text-xl font-semibold text-slate-700">Manage Pharmacy Bills</h3>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by patient..." 
                                    className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                                <Plus size={16} className="mr-2" />
                                <span>Create Bill</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 hidden sm:table-cell">Prescription ID</th>
                                    <th scope="col" className="px-6 py-3">Patient</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Payment Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((bill) => {
                                    const message = `Hello ${bill.patientName},\n\nThis is a notification regarding your pharmacy bill *#${bill.id}* for a total amount of *₹${(bill.totalAmount || 0).toLocaleString('en-IN')}*.\n\nThank you,\n${clinicSettings.name}`;
                                    const encodedMessage = encodeURIComponent(message);
                                    const confirmationUrl = `https://wa.me/91${bill.whatsappNumber}?text=${encodedMessage}`;

                                    return (
                                    <tr key={bill.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-slate-800 hidden sm:table-cell">{bill.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{bill.patientName}</td>
                                        <td className="px-6 py-4 font-semibold">₹{(bill.totalAmount || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(bill.paymentStatus)}`}>
                                                {bill.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center space-x-1">
                                                {bill.paymentStatus === PaymentStatus.Unpaid && (
                                                    <button 
                                                        onClick={() => handleMarkAsPaid(bill.id)} 
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                                                        title="Mark as Paid"
                                                    >
                                                        <CircleDollarSign size={18} />
                                                    </button>
                                                )}
                                                 {bill.whatsappNumber && (
                                                    <a href={confirmationUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-green-500 hover:bg-green-100 rounded-full" title="Send via WhatsApp">
                                                        <MessageSquare size={18} />
                                                    </a>
                                                )}
                                                <button onClick={() => handleDownloadInvoice(bill)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Download Invoice">
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    {filteredBills.length === 0 && (
                        <p className="text-center text-slate-500 py-12">No bills found.</p>
                    )}
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Bill">
                <form onSubmit={handleCreateBillSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Patient</label>
                        <select name="patientId" value={newBillData.patientId} onChange={handleNewBillChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-blue-500" required>
                            <option value="">Select a patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Medicine</label>
                        <select name="medicineName" value={newBillData.medicineName} onChange={handleNewBillChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-blue-500" required>
                            <option value="">Select a medicine</option>
                            {inventory.filter(i => i.stock > 0).map(i => <option key={i.id} value={i.name}>{i.name} (Stock: {i.stock})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Quantity</label>
                        <input type="number" name="quantity" value={newBillData.quantity} onChange={handleNewBillChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-blue-500" min="1" required />
                    </div>
                    <div className="flex items-center pt-2">
                        <input 
                            id="markAsPaid"
                            type="checkbox" 
                            name="markAsPaid" 
                            checked={newBillData.markAsPaid} 
                            onChange={handleNewBillChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="markAsPaid" className="ml-2 block text-sm text-slate-900">
                            Mark as Paid immediately
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Create Bill</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default PharmacyBilling;
