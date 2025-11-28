import React, { useState, useMemo } from 'react';
import { LabReport, ClinicSettings, Doctor, LabReportStatus } from '../../types';
import { TestTube2, Download } from 'lucide-react';
import LabReportPDF from '../admin/LabReportPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PatientLabReportsProps {
    reports: LabReport[];
    clinicSettings: ClinicSettings;
    doctors: Doctor[];
}

const getStatusColor = (status: LabReportStatus) => {
    switch(status) {
        case LabReportStatus.Completed: return 'bg-green-100 text-green-800';
        case LabReportStatus.Processing: return 'bg-yellow-100 text-yellow-800';
        case LabReportStatus.Pending: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const PatientLabReports: React.FC<PatientLabReportsProps> = ({ reports, clinicSettings, doctors }) => {
    const [pdfReportData, setPdfReportData] = useState<any>(null);

    const generatePdf = () => {
        const ticketElement = document.getElementById('print-area');
        if (!ticketElement || !pdfReportData) {
            setPdfReportData(null);
            return;
        }

        html2canvas(ticketElement, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const margin = 15;
            const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
            pdf.save(`Lab-Report-${pdfReportData.reportId}.pdf`);
        }).catch(error => {
            console.error("Error generating PDF:", error);
        }).finally(() => {
            setPdfReportData(null);
        });
    };

    const reportsWithDetails = useMemo(() => {
        return reports.map(report => ({
            ...report,
            doctorName: doctors.find(d => d.id === report.doctorId)?.name || 'N/A',
        })).sort((a,b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    }, [reports, doctors]);

    const handleDownloadPdf = (report: any) => {
        setPdfReportData(report);
    };

    return (
        <>
            <div style={{ position: 'fixed', left: '-2000px', top: 0, zIndex: -1 }}>
              {pdfReportData && <LabReportPDF report={{...pdfReportData, patientName: reports.find(r => r.id === pdfReportData.id)?.patientId}} clinicSettings={clinicSettings} />}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <h3 className="font-heading text-xl font-semibold text-gray-700 mb-6 flex items-center">
                    <TestTube2 className="mr-3 text-primary" />
                    My Lab Reports
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Report ID</th>
                                <th scope="col" className="px-6 py-3">Test Name</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportsWithDetails.map(report => (
                                <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-700">{report.reportId}</td>
                                    <td className="px-6 py-4">{report.testName}</td>
                                    <td className="px-6 py-4">{report.reportDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {report.status === LabReportStatus.Completed ? (
                                            <button 
                                                onClick={() => handleDownloadPdf(report)} 
                                                className="text-indigo-500 hover:text-indigo-700 p-2 inline-flex items-center" 
                                                title="Download Report as PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {reports.length === 0 && (
                    <p className="text-center text-gray-500 py-8">You have no lab reports on record.</p>
                )}
            </div>
        </>
    );
};

export default PatientLabReports;