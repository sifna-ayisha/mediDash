import React, { useState, useMemo } from 'react';
import { Department, Doctor } from '../../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';

interface DepartmentsManagementProps {
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    doctors: Doctor[];
}

const DepartmentForm: React.FC<{ department?: Department | null; doctors: Doctor[]; onSave: (department: Department) => void; onCancel: () => void }> = ({ department, doctors, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Department>(department || { id: '', name: '', head: '', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || `dep${Date.now()}` });
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Department Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Head of Department</label>
                <select name="head" value={formData.head} onChange={handleChange} className={commonInputClass} required>
                    <option value="">Select a Doctor</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={commonInputClass} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Department</button>
            </div>
        </form>
    );
}

const DepartmentsManagement: React.FC<DepartmentsManagementProps> = ({ departments, setDepartments, doctors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (department: Department) => {
        if (editingDepartment) {
            setDepartments(departments.map(d => d.id === department.id ? department : d));
        } else {
            setDepartments([...departments, department]);
        }
        setIsModalOpen(false);
        setEditingDepartment(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            setDepartments(departments.filter(d => d.id !== id));
        }
    };
    
    const departmentsWithHeadNames = useMemo(() => {
        return departments.map(dep => ({
            ...dep,
            headName: doctors.find(doc => doc.id === dep.head)?.name || 'N/A'
        }))
    }, [departments, doctors]);

    const filteredDepartments = useMemo(() =>
        departmentsWithHeadNames.filter(dep =>
            dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dep.headName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [departmentsWithHeadNames, searchTerm]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-heading text-xl font-semibold text-slate-700">Manage Departments</h3>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search departments..." 
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => { setEditingDepartment(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                        <Plus size={16} className="mr-2" />
                        <span>Add New</span>
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-sm text-slate-700 bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Department Name</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Head of Department</th>
                            <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredDepartments.map(dep => (
                            <tr key={dep.id} className="hover:bg-slate-50">
                                <td className="px-6 py-5 font-medium text-slate-900">{dep.name}</td>
                                <td className="px-6 py-5">{dep.headName}</td>
                                <td className="px-6 py-5 truncate max-w-xs hidden md:table-cell">{dep.description}</td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex justify-center items-center">
                                        <button onClick={() => { setEditingDepartment(dep); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(dep.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDepartment ? 'Edit Department' : 'Add New Department'}>
                <DepartmentForm department={editingDepartment} doctors={doctors} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingDepartment(null); }} />
            </Modal>
        </div>
    );
};

export default DepartmentsManagement;