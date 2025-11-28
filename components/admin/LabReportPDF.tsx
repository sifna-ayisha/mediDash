import React from 'react';
import { Hospital, Beaker } from 'lucide-react';
import { ClinicSettings, LabTestParameter } from '../../types';

interface LabReportPDFProps {
    report: any;
    clinicSettings: ClinicSettings;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-1.5">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="col-span-2 text-slate-800">{value}</span>
    </div>
);

const LabReportPDF: React.FC<LabReportPDFProps> = ({ report, clinicSettings }) => {
    const fee = report.testFee || 0;
    const gstRate = clinicSettings.gstRate || 0;
    const gstAmount = (fee * gstRate) / 100;
    const totalAmount = fee + gstAmount;

    return (
        <div id="print-area">
            <div className="p-10 max-w-4xl mx-auto my-10 font-sans bg-white shadow-2xl rounded-lg border-t-8 border-blue-600">
                <header className="flex justify-between items-start pb-4 border-b-2 border-slate-200">
                    <div className="flex items-center">
                         {clinicSettings.logo ? (
                           <img src={clinicSettings.logo} alt="Clinic Logo" className="h-16 w-auto mr-4" />
                        ) : (
                           <Hospital size={40} className="text-blue-600 mr-3" />
                        )}
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-slate-800">{clinicSettings.name}</h1>
                            <p className="text-xs text-slate-500 max-w-xs">{clinicSettings.address}</p>
                            <p className="text-xs text-slate-500">GSTIN: {clinicSettings.gstNumber}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="font-heading text-2xl font-bold text-slate-600">Lab Report</h2>
                        <p className="text-sm text-slate-500 font-mono">#{report.reportId}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 my-6 text-sm">
                    <div>
                        <h3 className="font-semibold text-slate-500 uppercase text-xs mb-2 tracking-wider">Patient Details</h3>
                        <InfoRow label="Patient Name" value={report.patientName} />
                        <InfoRow label="Test Name" value={report.testName} />
                    </div>
                    <div>
                         <h3 className="font-semibold text-slate-500 uppercase text-xs mb-2 tracking-wider">Report Details</h3>
                         <InfoRow label="Report Date" value={report.reportDate} />
                         <InfoRow label="Requesting Dr." value={report.doctorName} />
                    </div>
                </section>

                <section className="mb-6">
                    <h3 className="font-semibold text-slate-500 uppercase text-xs mb-2 tracking-wider">Test Results</h3>
                    <div className="overflow-x-auto border rounded-lg border-slate-200">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-2 font-semibold">Parameter</th>
                                    <th className="px-4 py-2 font-semibold">Observed Value</th>
                                    <th className="px-4 py-2 font-semibold">Reference Value</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-800">
                                {report.parameters?.length > 0 ? report.parameters.map((param: LabTestParameter, index: number) => (
                                    <tr key={index} className="border-t border-slate-200">
                                        <td className="px-4 py-2.5 font-medium">{param.name}</td>
                                        <td className="px-4 py-2.5">{param.observedValue}</td>
                                        <td className="px-4 py-2.5">{param.referenceValue}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center p-6 text-slate-500">No parameters recorded for this test.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
                    <h3 className="font-semibold text-slate-500 uppercase text-xs mb-2 tracking-wider">Conclusion</h3>
                    <p className="text-slate-800 text-sm whitespace-pre-wrap">{report.resultSummary}</p>
                </section>
                
                 <section className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <h3 className="font-semibold text-slate-500 uppercase text-xs mb-2 tracking-wider">Billing Details</h3>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Test Fee:</span>
                            <span className="font-medium text-slate-800">₹{fee.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-600">GST ({gstRate}%):</span>
                            <span className="font-medium text-slate-800">₹{gstAmount.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between border-t-2 border-slate-300 pt-2 mt-2 font-bold text-base">
                            <span className="text-slate-800">Total Amount:</span>
                            <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 pt-6 border-t border-slate-200 text-center">
                     <p className="text-xs text-slate-400">
                        This is a computer-generated report. End of Report.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default LabReportPDF;
