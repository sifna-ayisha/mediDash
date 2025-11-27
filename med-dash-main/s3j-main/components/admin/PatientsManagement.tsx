import React, { useState, useMemo } from 'react';
import { Patient, PaymentStatus } from '../../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';

interface PatientsManagementProps {
    patients: Patient[];
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const PatientForm: React.FC<{ patient?: Patient | null; onSave: (patient: Patient) => void; onCancel: () => void }> = ({ patient, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Patient>(patient || { id: '', name: '', age: 0, gender: 'Other', email: '', phone: '', whatsappNumber: '', address: '', admitDate: '', dischargeDate: '', roomNumber: '', paymentStatus: PaymentStatus.Unpaid });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || `pat${Date.now()}` });
    };
    
    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className={commonInputClass} required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={commonInputClass} required>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={commonInputClass} required />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={commonInputClass} required pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">WhatsApp Number (Preferred)</label>
                    <input type="tel" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} className={commonInputClass} pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Admit Date</label>
                    <input type="date" name="admitDate" value={formData.admitDate || ''} onChange={handleChange} className={commonInputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Discharge Date</label>
                    <input type="date" name="dischargeDate" value={formData.dischargeDate || ''} onChange={handleChange} className={commonInputClass} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Room Number</label>
                    <input type="text" name="roomNumber" value={formData.roomNumber || ''} onChange={handleChange} className={commonInputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Payment Status</label>
                    <select name="paymentStatus" value={formData.paymentStatus || PaymentStatus.Unpaid} onChange={handleChange} className={commonInputClass}>
                        <option value={PaymentStatus.Paid}>Paid</option>
                        <option value={PaymentStatus.Unpaid}>Unpaid</option>
                    </select>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={commonInputClass} required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Patient</button>
            </div>
        </form>
    );
}

const getPaymentStatusColor = (status?: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-100 text-green-800';
        case PaymentStatus.Unpaid: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const PatientsManagement: React.FC<PatientsManagementProps> = ({ patients, setPatients }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

     const handleSave = (patient: Patient) => {
        if (editingPatient) {
            setPatients(patients.map(p => p.id === patient.id ? patient : p));
        } else {
            setPatients([...patients, patient]);
        }
        setIsModalOpen(false);
        setEditingPatient(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            setPatients(patients.filter(p => p.id !== id));
        }
    };

    const filteredPatients = useMemo(() => 
        patients.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [patients, searchTerm]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-heading text-xl font-semibold text-slate-700">Manage Patients</h3>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => { setEditingPatient(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                        <Plus size={16} className="mr-2" />
                        <span>Add New</span>
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-sm text-slate-700 bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Age</th>
                            <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Room No.</th>
                            <th scope="col" className="px-6 py-4 font-semibold hidden lg:table-cell">Admit Date</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Payment Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredPatients.map(patient => (
                            <tr key={patient.id} className="hover:bg-slate-50">
                                <td className="px-6 py-5 font-medium text-slate-900">{patient.name}</td>
                                <td className="px-6 py-5">{patient.age}</td>
                                <td className="px-6 py-5 hidden md:table-cell">{patient.roomNumber || 'N/A'}</td>
                                <td className="px-6 py-5 hidden lg:table-cell">{patient.admitDate || 'N/A'}</td>
                                <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(patient.paymentStatus)}`}>
                                        {patient.paymentStatus || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex justify-center items-center">
                                        <button onClick={() => { setEditingPatient(patient); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(patient.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPatient ? 'Edit Patient' : 'Add New Patient'}>
                <PatientForm patient={editingPatient} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingPatient(null); }} />
            </Modal>
        </div>
    );
};

export default PatientsManagement;