import React, { useState } from 'react';
import { LabReport, Patient, Doctor, LabReportStatus, SampleStatus, LabTestParameter, PaymentStatus } from '../../types';
import { Plus, X } from 'lucide-react';

interface LabReportFormProps {
    report?: LabReport | null;
    patients: Patient[];
    doctors: Doctor[];
    onSave: (report: LabReport) => void;
    onCancel: () => void;
    isCreatingBill?: boolean;
}

const LabReportForm: React.FC<LabReportFormProps> = ({ report, patients, doctors, onSave, onCancel, isCreatingBill = false }) => {
    const isEditing = !!report;
    
    const [formData, setFormData] = useState<Partial<LabReport>>(
        report 
        ? { ...report, parameters: report.parameters.length > 0 ? report.parameters : [{ name: '', observedValue: '', referenceValue: '' }] }
        : {
            patientId: '',
            doctorId: '',
            testName: '',
            status: isCreatingBill ? LabReportStatus.Completed : LabReportStatus.Pending,
            parameters: [{ name: '', observedValue: '', referenceValue: '' }],
            resultSummary: '',
            testFee: 0,
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['testFee'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
    };

    const handleParameterChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newParameters = [...(formData.parameters || [])];
        newParameters[index] = { ...newParameters[index], [name]: value };
        setFormData(prev => ({ ...prev, parameters: newParameters }));
    };
    
    const handleAddParameter = () => {
        setFormData(prev => ({
            ...prev,
            parameters: [...(prev.parameters || []), { name: '', observedValue: '', referenceValue: '' }]
        }));
    };
    
    const handleRemoveParameter = (index: number) => {
        if (formData.parameters && formData.parameters.length > 1) {
            const newParameters = [...formData.parameters];
            newParameters.splice(index, 1);
            setFormData(prev => ({ ...prev, parameters: newParameters }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isEditing && (!formData.patientId || !formData.doctorId || !formData.testName)) {
            alert('Please fill in patient, doctor, and test name.');
            return;
        }
        
        const finalReportData: LabReport = {
            id: report?.id || `lab${Date.now()}`,
            reportId: report?.reportId || `LAB-RPT-${Math.floor(Date.now() / 1000)}`,
            patientId: formData.patientId!,
            doctorId: formData.doctorId!,
            testName: formData.testName!,
            parameters: (formData.parameters || []).filter(p => p.name.trim() !== ''),
            resultSummary: formData.resultSummary || (isEditing && report ? report.resultSummary : 'Pending analysis.'),
            reportDate: report?.reportDate || new Date().toISOString().split('T')[0],
            status: formData.status || LabReportStatus.Pending,
            sampleId: report?.sampleId || `SMPL-${Math.floor(Date.now() / 1000)}`,
            sampleStatus: report?.sampleStatus || SampleStatus.Collected,
            testFee: formData.testFee || 0,
            paymentStatus: report?.paymentStatus || PaymentStatus.Unpaid,
        };
        
        onSave(finalReportData);
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Patient</label>
                        <select name="patientId" value={formData.patientId} onChange={handleChange} className={commonInputClass} required>
                            <option value="">Select Patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Requesting Doctor</label>
                        <select name="doctorId" value={formData.doctorId} onChange={handleChange} className={commonInputClass} required>
                            <option value="">Select Doctor</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Test Name</label>
                        <input type="text" name="testName" value={formData.testName} onChange={handleChange} className={commonInputClass} placeholder="e.g., Complete Blood Count" required />
                    </div>
                 </div>
            )}
            
            {isEditing && report && (
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p><span className="font-semibold">Patient:</span> {patients.find(p => p.id === report.patientId)?.name}</p>
                    <p><span className="font-semibold">Test:</span> {report.testName}</p>
                 </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={commonInputClass} required>
                        {Object.values(LabReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700">Test Fee (₹)</label>
                     <input type="number" name="testFee" value={formData.testFee || ''} onChange={handleChange} className={commonInputClass} required min="0" />
                </div>
            </div>

            <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-slate-700">Test Parameters</h4>
                {(formData.parameters || []).map((param, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
                        <input type="text" name="name" placeholder="Parameter Name" value={param.name} onChange={(e) => handleParameterChange(index, e)} className={`${commonInputClass} sm:col-span-3`} />
                        <input type="text" name="observedValue" placeholder="Observed Value" value={param.observedValue} onChange={(e) => handleParameterChange(index, e)} className={`${commonInputClass} sm:col-span-2`} />
                        <input type="text" name="referenceValue" placeholder="Reference Value" value={param.referenceValue} onChange={(e) => handleParameterChange(index, e)} className={`${commonInputClass} sm:col-span-2`} />
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleAddParameter} className="flex items-center text-sm text-blue-600 font-semibold hover:underline">
                <Plus size={16} className="mr-1" /> Add Parameter
            </button>

            <div>
                <label className="block text-sm font-medium text-slate-700">Result Summary / Conclusion</label>
                <textarea name="resultSummary" value={formData.resultSummary} onChange={handleChange} rows={3} className={commonInputClass} />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{isCreatingBill ? 'Create Bill' : 'Save Report'}</button>
            </div>
        </form>
    );
};

export default LabReportForm;
