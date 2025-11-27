import React, { useState, useMemo } from 'react';
import { LabReport, Patient, PaymentStatus, LabReportStatus, Doctor } from '../../types';
import { IndianRupee, Search, Wallet, FileCheck, CircleDollarSign, Plus } from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LabReportForm from './LabReportForm';

interface LabBillingProps {
    labReports: LabReport[];
    setLabReports: React.Dispatch<React.SetStateAction<LabReport[]>>;
    patients: Patient[];
    doctors: Doctor[];
}

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-100 text-green-800';
        case PaymentStatus.Unpaid: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const LabBilling: React.FC<LabBillingProps> = ({ labReports, setLabReports, patients, doctors }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const completedReports = useMemo(() => {
        return labReports
            .filter(r => r.status === LabReportStatus.Completed)
            .map(report => ({
                ...report,
                patientName: patients.find(p => p.id === report.patientId)?.name || 'N/A',
            }))
            .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    }, [labReports, patients]);

    const stats = useMemo(() => {
        const totalBilled = completedReports.reduce((sum, r) => sum + r.testFee, 0);
        const totalCollected = completedReports
            .filter(r => r.paymentStatus === PaymentStatus.Paid)
            .reduce((sum, r) => sum + r.testFee, 0);
        const outstandingBills = completedReports.filter(r => r.paymentStatus === PaymentStatus.Unpaid).length;
        
        return { totalBilled, totalCollected, outstandingBills };
    }, [completedReports]);
    
    const filteredReports = useMemo(() => 
        completedReports.filter(report => 
            report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportId.toLowerCase().includes(searchTerm.toLowerCase())
        ), [completedReports, searchTerm]);
        
    const handleMarkAsPaid = (reportId: string) => {
        setLabReports(prev => 
            prev.map(r => r.id === reportId ? { ...r, paymentStatus: PaymentStatus.Paid } : r)
        );
    };
    
    const handleSave = (reportToSave: LabReport) => {
        setLabReports(prev => [reportToSave, ...prev]);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Total Billed Amount" value={`₹${stats.totalBilled.toLocaleString('en-IN')}`} icon="IndianRupee" color="blue" />
                <Card title="Collected Amount" value={`₹${stats.totalCollected.toLocaleString('en-IN')}`} icon="FileCheck" color="green" />
                <Card title="Outstanding Bills" value={stats.outstandingBills.toString()} icon="Wallet" color="red" />
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="font-heading text-xl font-semibold text-slate-700">Manage Lab Bills</h3>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by patient, ID..." 
                                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                            <Plus size={16} className="mr-2" />
                            <span>Create Bill</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Report ID</th>
                                <th scope="col" className="px-6 py-3">Patient</th>
                                <th scope="col" className="px-6 py-3">Report Date</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Payment Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-800">{report.reportId}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{report.patientName}</td>
                                    <td className="px-6 py-4">{report.reportDate}</td>
                                    <td className="px-6 py-4 font-semibold">₹{report.testFee.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(report.paymentStatus)}`}>
                                            {report.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {report.paymentStatus === PaymentStatus.Unpaid ? (
                                            <button 
                                                onClick={() => handleMarkAsPaid(report.id)} 
                                                className="text-green-600 hover:text-green-800 p-2 inline-flex items-center text-xs font-semibold bg-green-100 rounded-lg hover:bg-green-200"
                                                title="Mark as Paid"
                                            >
                                                <CircleDollarSign size={16} className="mr-2" />
                                                Mark as Paid
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Cleared</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredReports.length === 0 && (
                    <p className="text-center text-slate-500 py-12">No bills found.</p>
                )}
            </div>
             <Modal 
                isOpen={isModalOpen} 
                onClose={handleCancel} 
                title="Create New Bill"
              >
                {isModalOpen && <LabReportForm 
                    patients={patients}
                    doctors={doctors}
                    onSave={handleSave} 
                    onCancel={handleCancel}
                    isCreatingBill={true}
                />}
            </Modal>
        </div>
    );
};

export default LabBilling;