import React from 'react';
import { Prescription, Doctor, PrescriptionStatus } from '../../types';
import { FilePlus } from 'lucide-react';

interface PatientPrescriptionsProps {
    prescriptions: Prescription[];
    doctors: Doctor[];
}

const PatientPrescriptions: React.FC<PatientPrescriptionsProps> = ({ prescriptions, doctors }) => {

    const getDoctorName = (doctorId: string) => {
        return doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';
    }

    const sortedPrescriptions = [...prescriptions].sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <FilePlus className="mr-3 text-primary" />
                My Prescriptions
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date Issued</th>
                            <th scope="col" className="px-6 py-3">Doctor</th>
                            <th scope="col" className="px-6 py-3">Medicine</th>
                            <th scope="col" className="px-6 py-3">Dosage</th>
                            <th scope="col" className="px-6 py-3">Instructions</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPrescriptions.map(presc => (
                            <tr key={presc.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{presc.dateIssued}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{getDoctorName(presc.doctorId)}</td>
                                <td className="px-6 py-4">{presc.medicineName}</td>
                                <td className="px-6 py-4">{presc.dosage}</td>
                                <td className="px-6 py-4">{presc.instructions}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${presc.status === PrescriptionStatus.Issued ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {presc.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {prescriptions.length === 0 && (
                <p className="text-center text-gray-500 py-8">You have no prescriptions on record.</p>
            )}
        </div>
    );
};

export default PatientPrescriptions;
