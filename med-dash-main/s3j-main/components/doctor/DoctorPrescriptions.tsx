import React, { useState } from 'react';
import { Prescription, Patient, Doctor, ClinicSettings } from '../../types';
import { FilePlus, Download, MessageSquare } from 'lucide-react';
import PrescriptionPDF from './PrescriptionPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DoctorPrescriptionsProps {
    prescriptions: Prescription[];
    patients: Patient[];
    doctor: Doctor;
    clinicSettings: ClinicSettings;
}

const DoctorPrescriptions: React.FC<DoctorPrescriptionsProps> = ({ prescriptions, patients, doctor, clinicSettings }) => {
    
    const [pdfData, setPdfData] = useState<any>(null);

    const handleDownload = () => {
        const reportElement = document.getElementById('print-area');
        if (reportElement && pdfData) {
            html2canvas(reportElement, { scale: 2.5 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Prescription-${pdfData.prescription.id}.pdf`);
            }).finally(() => setPdfData(null));
        }
    };
    
    React.useEffect(() => {
        if (pdfData) {
            const timer = setTimeout(handleDownload, 100);
            return () => clearTimeout(timer);
        }
    }, [pdfData]);


    const getPatient = (patientId: string) => {
        return patients.find(p => p.id === patientId);
    }

    const handleDownloadPdf = (prescription: Prescription) => {
        const patient = getPatient(prescription.patientId);
        if (patient) {
            setPdfData({ prescription, patient, doctor, clinicSettings });
        }
    };

    return (
        <>
            <div className="fixed left-[-2000px] top-0 z-[-1]">
                {pdfData && <PrescriptionPDF {...pdfData} />}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <FilePlus className="mr-3 text-blue-600" />
                    Issued Prescriptions
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date Issued</th>
                                <th scope="col" className="px-6 py-3">Patient</th>
                                <th scope="col" className="px-6 py-3">Medicine</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map(presc => {
                                const patient = getPatient(presc.patientId);
                                const message = `Hello ${patient?.name},\n\nYour prescription for *${presc.medicineName}* from Dr. ${doctor.name} is ready.\n\nPlease visit the pharmacy at your convenience.\n\nThank you,\n${clinicSettings.name}`;
                                const encodedMessage = encodeURIComponent(message);
                                const confirmationUrl = `https://wa.me/91${patient?.whatsappNumber}?text=${encodedMessage}`;

                                return (
                                <tr key={presc.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4">{presc.dateIssued}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{patient?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">{presc.medicineName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${presc.status === 'Issued' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {presc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <div className="flex justify-center items-center">
                                            {patient?.whatsappNumber && (
                                                <a href={confirmationUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-green-500 hover:bg-green-100 rounded-full" title="Send via WhatsApp">
                                                    <MessageSquare size={18} />
                                                </a>
                                            )}
                                            <button onClick={() => handleDownloadPdf(presc)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Download PDF">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                {prescriptions.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No prescriptions have been issued.</p>
                )}
            </div>
        </>
    );
};

export default DoctorPrescriptions;
