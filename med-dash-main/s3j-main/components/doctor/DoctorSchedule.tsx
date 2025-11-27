import React from 'react';
import { Appointment, Patient, AppointmentStatus } from '../../types';
import { CalendarDays } from 'lucide-react';

interface DoctorScheduleProps {
    appointments: Appointment[];
    patients: Patient[];
}

const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
        case AppointmentStatus.Completed: return 'bg-green-100 text-green-800';
        case AppointmentStatus.Cancelled: return 'bg-red-100 text-red-800';
        case AppointmentStatus.Scheduled: 
        default:
            return 'bg-blue-100 text-blue-800';
    }
}

const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ appointments, patients }) => {
    
    const getPatientName = (patientId: string) => {
        return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
    }

    const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
            <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6 flex items-center">
                <CalendarDays className="mr-3 text-blue-600" />
                My Schedule
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Patient</th>
                            <th scope="col" className="px-6 py-3">Reason</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.map(apt => (
                            <tr key={apt.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4">{apt.date}</td>
                                <td className="px-6 py-4">{apt.time}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{getPatientName(apt.patientId)}</td>
                                <td className="px-6 py-4">{apt.reason}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {appointments.length === 0 && (
                <p className="text-center text-slate-500 py-8">You have no appointments scheduled.</p>
            )}
        </div>
    );
};

export default DoctorSchedule;
