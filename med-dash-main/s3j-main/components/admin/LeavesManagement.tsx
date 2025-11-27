import React, { useState, useMemo } from 'react';
import { LeaveRequest, LeaveStatus, Doctor } from '../../types';
import { Check, X, CalendarOff, Filter, Search } from 'lucide-react';

interface LeavesManagementProps {
    leaveRequests: LeaveRequest[];
    doctors: Doctor[];
    onUpdateStatus: (id: string, status: LeaveStatus) => void;
}

const LeavesManagement: React.FC<LeavesManagementProps> = ({ leaveRequests, doctors, onUpdateStatus }) => {
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name || 'Unknown Doctor';

    const pendingRequests = useMemo(() => 
        leaveRequests.filter(req => req.status === LeaveStatus.Pending),
        [leaveRequests]
    );

    const filteredRequests = useMemo(() => {
        return leaveRequests.filter(req => {
            const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
            const docName = getDoctorName(req.doctorId).toLowerCase();
            const matchesSearch = docName.includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [leaveRequests, statusFilter, searchTerm, doctors]);

    return (
        <div className="space-y-8">
             <h2 className="font-heading text-2xl font-bold text-slate-800 flex items-center">
                <CalendarOff className="mr-2 text-slate-600" />
                Leave Management
            </h2>

            {/* Pending Requests Section - Quick Actions */}
            {pendingRequests.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-2">Pending Requests ({pendingRequests.length})</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-slate-800 text-lg">{getDoctorName(req.doctorId)}</div>
                                    <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Applied: {req.requestDate}</span>
                                </div>
                                <div className="text-sm text-slate-600 mb-2">
                                    <p><span className="font-medium">Date:</span> {req.startDate} <span className="text-slate-400 mx-1">to</span> {req.endDate}</p>
                                    <p className="mt-1"><span className="font-medium">Reason:</span> {req.reason}</p>
                                </div>
                                <div className="flex space-x-3 mt-4">
                                    <button 
                                        onClick={() => onUpdateStatus(req.id, LeaveStatus.Approved)}
                                        className="flex-1 flex items-center justify-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Check size={18} className="mr-2" />
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => onUpdateStatus(req.id, LeaveStatus.Rejected)}
                                        className="flex-1 flex items-center justify-center py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X size={18} className="mr-2" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Requests Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="font-heading text-lg font-semibold text-slate-700">All Leave Requests</h3>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                         {/* Search */}
                         <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search doctor..." 
                                className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Filter */}
                        <div className="flex items-center space-x-2">
                             <Filter className="text-slate-400" size={20} />
                             <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | 'All')}
                                className="p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                             >
                                <option value="All">All Status</option>
                                {Object.values(LeaveStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                             </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Doctor</th>
                                <th scope="col" className="px-6 py-3">Start Date</th>
                                <th scope="col" className="px-6 py-3">End Date</th>
                                <th scope="col" className="px-6 py-3">Reason</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map(req => (
                                    <tr key={req.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{getDoctorName(req.doctorId)}</td>
                                        <td className="px-6 py-4">{req.startDate}</td>
                                        <td className="px-6 py-4">{req.endDate}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                req.status === LeaveStatus.Approved ? 'bg-green-100 text-green-800' : 
                                                req.status === LeaveStatus.Rejected ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {req.status === LeaveStatus.Pending ? (
                                                <div className="flex justify-center space-x-2">
                                                    <button 
                                                        onClick={() => onUpdateStatus(req.id, LeaveStatus.Approved)}
                                                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onUpdateStatus(req.id, LeaveStatus.Rejected)}
                                                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-slate-500 italic">No leave requests found matching criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeavesManagement;