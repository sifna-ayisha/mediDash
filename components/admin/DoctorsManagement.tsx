import React, { useState, useMemo } from 'react';
import { Doctor } from '../../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';

interface DoctorsManagementProps {
    doctors: Doctor[];
    setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
}

const DoctorForm: React.FC<{ doctor?: Doctor | null; onSave: (doctor: Doctor) => void; onCancel: () => void }> = ({ doctor, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Doctor>(doctor || { id: '', name: '', specialty: '', email: '', phone: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || `doc${Date.now()}` });
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Specialty</label>
                <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className={commonInputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={commonInputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={commonInputClass} required pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password || ''} 
                    onChange={handleChange} 
                    className={commonInputClass} 
                    placeholder={doctor ? 'Leave blank to keep current' : ''}
                    required={!doctor} 
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Doctor</button>
            </div>
        </form>
    );
}

const DoctorsManagement: React.FC<DoctorsManagementProps> = ({ doctors, setDoctors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (doctor: Doctor) => {
        if (editingDoctor) {
            const finalDoctor = {...doctor};
            if (!finalDoctor.password) {
                const originalDoctor = doctors.find(d => d.id === editingDoctor.id);
                finalDoctor.password = originalDoctor?.password;
            }
            setDoctors(doctors.map(d => d.id === editingDoctor.id ? finalDoctor : d));
        } else {
            setDoctors([...doctors, doctor]);
        }
        setIsModalOpen(false);
        setEditingDoctor(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            setDoctors(doctors.filter(d => d.id !== id));
        }
    };

    const filteredDoctors = useMemo(() => 
        doctors.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [doctors, searchTerm]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-heading text-xl font-semibold text-slate-700">Manage Doctors</h3>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search doctors..." 
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => { setEditingDoctor(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
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
                            <th scope="col" className="px-6 py-4 font-semibold">Specialty</th>
                            <th scope="col" className="px-6 py-4 font-semibold hidden lg:table-cell">Email</th>
                            <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Phone</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredDoctors.map(doctor => (
                            <tr key={doctor.id} className="hover:bg-slate-50">
                                <td className="px-6 py-5 font-medium text-slate-900">{doctor.name}</td>
                                <td className="px-6 py-5">{doctor.specialty}</td>
                                <td className="px-6 py-5 hidden lg:table-cell">{doctor.email}</td>
                                <td className="px-6 py-5 hidden md:table-cell">{doctor.phone}</td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex justify-center items-center">
                                        <button onClick={() => { setEditingDoctor(doctor); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}>
                <DoctorForm doctor={editingDoctor} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingDoctor(null); }} />
            </Modal>
        </div>
    );
};

export default DoctorsManagement;