import React, { useState } from 'react';
import { Doctor, LeaveRequest, LeaveStatus } from '../../types';
import { CalendarOff, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../common/Modal';

interface DoctorLeavesProps {
    doctor: Doctor;
    leaveRequests: LeaveRequest[];
    onApplyLeave: (request: LeaveRequest) => void;
}

const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
        case LeaveStatus.Approved: return 'bg-green-100 text-green-800';
        case LeaveStatus.Rejected: return 'bg-red-100 text-red-800';
        case LeaveStatus.Pending: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
        case LeaveStatus.Approved: return <CheckCircle size={16} className="mr-1" />;
        case LeaveStatus.Rejected: return <XCircle size={16} className="mr-1" />;
        case LeaveStatus.Pending: return <Clock size={16} className="mr-1" />;
        default: return null;
    }
};

const DoctorLeaves: React.FC<DoctorLeavesProps> = ({ doctor, leaveRequests, onApplyLeave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });

    const myLeaves = leaveRequests.filter(req => req.doctorId === doctor.id).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert("Start date cannot be after end date.");
            return;
        }

        const newRequest: LeaveRequest = {
            id: `leave${Date.now()}`,
            doctorId: doctor.id,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason,
            status: LeaveStatus.Pending,
            requestDate: new Date().toISOString().split('T')[0]
        };

        onApplyLeave(newRequest);
        setIsModalOpen(false);
        setFormData({ startDate: '', endDate: '', reason: '' });
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="font-heading text-xl font-semibold text-slate-700 flex items-center">
                        <CalendarOff className="mr-3 text-blue-600" />
                        My Leaves
                    </h3>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap"
                    >
                        <Plus size={16} className="mr-2" />
                        Apply for Leave
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Start Date</th>
                                <th scope="col" className="px-6 py-3">End Date</th>
                                <th scope="col" className="px-6 py-3">Reason</th>
                                <th scope="col" className="px-6 py-3">Applied On</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myLeaves.length > 0 ? (
                                myLeaves.map(req => (
                                    <tr key={req.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{req.startDate}</td>
                                        <td className="px-6 py-4">{req.endDate}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">{req.reason}</td>
                                        <td className="px-6 py-4 text-slate-400">{req.requestDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center w-fit ${getStatusColor(req.status)}`}>
                                                {getStatusIcon(req.status)}
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input 
                                type="date" 
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                        <textarea 
                            name="reason" 
                            value={formData.reason} 
                            onChange={handleChange} 
                            rows={3} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                            placeholder="Reason for leave..." 
                            required 
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Submit Application</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DoctorLeaves;