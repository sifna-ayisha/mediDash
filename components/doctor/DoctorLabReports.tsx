import React, { useState, useMemo } from 'react';
import { LabReport, ClinicSettings, Doctor, Patient, LabReportStatus } from '../../types';
import { TestTube2, Download, MessageSquare } from 'lucide-react';
import LabReportPDF from '../admin/LabReportPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DoctorLabReportsProps {
    reports: LabReport[];
    patients: Patient[];
    clinicSettings: ClinicSettings;
    doctors: Doctor[];
}

const getStatusColor = (status: LabReportStatus) => {
    switch(status) {
        case LabReportStatus.Completed: return 'bg-green-100 text-green-800';
        case LabReportStatus.Processing: return 'bg-amber-100 text-amber-800';
        case LabReportStatus.Pending: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const DoctorLabReports: React.FC<DoctorLabReportsProps> = ({ reports, patients, clinicSettings, doctors }) => {
    const [pdfReportData, setPdfReportData] = useState<any>(null);

     const handleDownload = () => {
        const reportElement = document.getElementById('print-area');
        if (reportElement && pdfReportData) {
            html2canvas(reportElement, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const margin = 10;
                const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
                pdf.save(`Lab-Report-${pdfReportData.reportId}.pdf`);
            }).finally(() => setPdfReportData(null));
        }
    };
    
    React.useEffect(() => {
        if (pdfReportData) {
            const timer = setTimeout(handleDownload, 100);
            return () => clearTimeout(timer);
        }
    }, [pdfReportData]);


    const reportsWithDetails = useMemo(() => {
        return reports.map(report => {
            const patient = patients.find(p => p.id === report.patientId);
            return {
                ...report,
                patientName: patient?.name || 'N/A',
                doctorName: doctors.find(d => d.id === report.doctorId)?.name || 'N/A',
                whatsappNumber: patient?.whatsappNumber,
            }
        }).sort((a,b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    }, [reports, patients, doctors]);

    const handleDownloadPdf = (report: any) => {
        setPdfReportData(report);
    };

    return (
        <>
            <div className="fixed left-[-2000px] top-0 z-[-1]">
              {pdfReportData && <LabReportPDF report={pdfReportData} clinicSettings={clinicSettings} />}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <TestTube2 className="mr-3 text-blue-600" />
                    Patient Lab Reports
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Report ID</th>
                                <th scope="col" className="px-6 py-3">Patient</th>
                                <th scope="col" className="px-6 py-3">Test Name</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportsWithDetails.map(report => {
                                const message = `Hello ${report.patientName},\n\nYour lab report for *${report.testName}* is ready.\n\nPlease contact the clinic for your results.\n\nThank you,\n${clinicSettings.name}`;
                                const encodedMessage = encodeURIComponent(message);
                                const confirmationUrl = `https://wa.me/91${report.whatsappNumber}?text=${encodedMessage}`;

                                return (
                                <tr key={report.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-700">{report.reportId}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{report.patientName}</td>
                                    <td className="px-6 py-4">{report.testName}</td>
                                    <td className="px-6 py-4">{report.reportDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {report.status === LabReportStatus.Completed ? (
                                            <div className="flex justify-center items-center">
                                                {report.whatsappNumber && (
                                                    <a href={confirmationUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-green-500 hover:bg-green-100 rounded-full" title="Send via WhatsApp">
                                                        <MessageSquare size={18} />
                                                    </a>
                                                )}
                                                <button 
                                                    onClick={() => handleDownloadPdf(report)} 
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" 
                                                    title="Download Report as PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                 {reports.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No lab reports found for your patients.</p>
                )}
            </div>
        </>
    );
};

export default DoctorLabReports;
