import React from 'react';
import { Patient } from '../../types';
import { Users, Mail, Phone } from 'lucide-react';

interface DoctorPatientsProps {
    patients: Patient[];
}

const DoctorPatients: React.FC<DoctorPatientsProps> = ({ patients }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
            <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6 flex items-center">
                <Users className="mr-3 text-blue-600" />
                My Patients
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Age</th>
                            <th scope="col" className="px-6 py-3">Gender</th>
                            <th scope="col" className="px-6 py-3">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(patient => (
                            <tr key={patient.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{patient.name}</td>
                                <td className="px-6 py-4">{patient.age}</td>
                                <td className="px-6 py-4">{patient.gender}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <a href={`mailto:${patient.email}`} className="text-slate-500 hover:text-blue-600" title={patient.email}><Mail size={16} /></a>
                                        <a href={`tel:${patient.phone}`} className="text-slate-500 hover:text-blue-600" title={patient.phone}><Phone size={16} /></a>
                                        <span>{patient.phone}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {patients.length === 0 && (
                <p className="text-center text-slate-500 py-8">No patients found.</p>
            )}
        </div>
    );
};

export default DoctorPatients;
