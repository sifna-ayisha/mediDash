import React, { useState, useMemo } from 'react';
import { LabReport, Patient, SampleStatus } from '../../types';
import { Search, ChevronRight, Check } from 'lucide-react';

interface SampleTrackingProps {
    labReports: LabReport[];
    setLabReports: React.Dispatch<React.SetStateAction<LabReport[]>>;
    patients: Patient[];
}

const sampleWorkflow: SampleStatus[] = [
    SampleStatus.Collected,
    SampleStatus.InTransit,
    SampleStatus.Received,
    SampleStatus.Analyzing
];

const SampleTracking: React.FC<SampleTrackingProps> = ({ labReports, setLabReports, patients }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const reportsWithDetails = useMemo(() => {
        return labReports.map(report => ({
            ...report,
            patientName: patients.find(p => p.id === report.patientId)?.name || 'N/A',
        })).sort((a,b) => sampleWorkflow.indexOf(a.sampleStatus) - sampleWorkflow.indexOf(b.sampleStatus));
    }, [labReports, patients]);

    const filteredReports = useMemo(() =>
        reportsWithDetails.filter(report =>
            report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.testName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [reportsWithDetails, searchTerm]);

    const handleUpdateStatus = (reportId: string) => {
        const currentReport = labReports.find(r => r.id === reportId);
        if (!currentReport) return;

        const currentIndex = sampleWorkflow.indexOf(currentReport.sampleStatus);
        if (currentIndex < sampleWorkflow.length - 1) {
            const nextStatus = sampleWorkflow[currentIndex + 1];
            setLabReports(prev =>
                prev.map(r => r.id === reportId ? { ...r, sampleStatus: nextStatus } : r)
            );
        }
    };

    const getNextActionText = (status: SampleStatus): string => {
        switch (status) {
            case SampleStatus.Collected: return 'Mark as In-Transit';
            case SampleStatus.InTransit: return 'Mark as Received';
            case SampleStatus.Received: return 'Start Analysis';
            case SampleStatus.Analyzing: return 'Analysis in Progress';
            default: return '';
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-heading text-xl font-semibold text-slate-700">Sample Tracking</h3>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by sample ID, patient..."
                        className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Visual Progress Tracker Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:space-x-4 mb-8 text-xs text-slate-500 font-medium">
                {sampleWorkflow.map((status, index) => (
                    <React.Fragment key={status}>
                        <span className="text-center">{status}</span>
                        {index < sampleWorkflow.length - 1 && <ChevronRight size={16} className="text-slate-300 hidden sm:inline-block" />}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(report => {
                    const currentStepIndex = sampleWorkflow.indexOf(report.sampleStatus);
                    const isCompleted = currentStepIndex === sampleWorkflow.length - 1;

                    return (
                        <div key={report.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800">{report.patientName}</p>
                                    <p className="text-sm text-slate-500">{report.testName}</p>
                                </div>
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{report.sampleId}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center space-x-1 pt-2">
                                {sampleWorkflow.map((status, index) => (
                                    <div key={status} className="flex-1 h-2 rounded-full" title={status}
                                         style={{ backgroundColor: index <= currentStepIndex ? '#2563eb' : '#e2e8f0' }}>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-blue-600">{report.sampleStatus}</p>

                            <button
                                onClick={() => handleUpdateStatus(report.id)}
                                disabled={isCompleted}
                                className={`w-full flex items-center justify-center mt-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                    isCompleted
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isCompleted ? <Check size={16} className="mr-2" /> : <ChevronRight size={16} className="mr-2" />}
                                {getNextActionText(report.sampleStatus)}
                            </button>
                        </div>
                    );
                })}
            </div>
             {filteredReports.length === 0 && (
                <p className="text-center text-slate-500 py-12">No samples found matching your search.</p>
            )}
        </div>
    );
};

export default SampleTracking;
