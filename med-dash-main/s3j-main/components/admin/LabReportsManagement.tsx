import React, { useState, useMemo } from 'react';
import { LabReport, Patient, Doctor, LabReportStatus, ClinicSettings } from '../../types';
import { Search, Download } from 'lucide-react';
import LabReportPDF from './LabReportPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface LabReportsManagementProps {
    reports: LabReport[];
    patients: Patient[];
    doctors: Doctor[];
    clinicSettings: ClinicSettings;
}

const getStatusColor = (status: LabReportStatus) => {
    switch(status) {
        case LabReportStatus.Completed: return 'bg-green-100 text-green-800';
        case LabReportStatus.Processing: return 'bg-amber-100 text-amber-800';
        case LabReportStatus.Pending: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const LabReportsManagement: React.FC<LabReportsManagementProps> = ({ reports, patients, doctors, clinicSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
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
        } else {
            setPdfReportData(null);
        }
    };

    React.useEffect(() => {
        if (pdfReportData) {
            // Delay to ensure component renders before capturing
            const timer = setTimeout(handleDownload, 100);
            return () => clearTimeout(timer);
        }
    }, [pdfReportData]);
    
    const reportsWithDetails = useMemo(() => {
        return reports.map(report => ({
            ...report,
            patientName: patients.find(p => p.id === report.patientId)?.name || 'N/A',
            doctorName: doctors.find(d => d.id === report.doctorId)?.name || 'N/A',
        }))
    }, [reports, patients, doctors]);

    const filteredReports = useMemo(() => 
        reportsWithDetails.filter(report => 
            report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportId.toLowerCase().includes(searchTerm.toLowerCase())
        ), [reportsWithDetails, searchTerm]);

    const handleDownloadPdf = (report: any) => {
        setPdfReportData(report);
    };

    return (
        <>
            <div className="fixed left-[-2000px] top-0 z-[-1]">
                {pdfReportData && <LabReportPDF report={pdfReportData} clinicSettings={clinicSettings} />}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="font-heading text-xl font-semibold text-slate-700">View Lab Reports</h3>
                    <div className="relative w-full md:w-auto md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by patient, test..." 
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
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
                            {filteredReports.map(report => (
                                <tr key={report.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-800">{report.reportId}</td>
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
                                            <button 
                                                onClick={() => handleDownloadPdf(report)} 
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" 
                                                title="Download Report as PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Not available</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default LabReportsManagement;
