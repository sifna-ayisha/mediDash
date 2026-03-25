import React, { useState } from 'react';
import { Prescription, Patient, Doctor, ClinicSettings, InventoryItem, PrescriptionStatus } from '../../types';
import { FilePlus, Download, MessageSquare, Plus, MinusCircle } from 'lucide-react';
import PrescriptionPDF from './PrescriptionPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Modal from '../common/Modal';

interface DoctorPrescriptionsProps {
    prescriptions: Prescription[];
    patients: Patient[];
    doctorPatients: Patient[];
    inventory: InventoryItem[];
    doctor: Doctor;
    clinicSettings: ClinicSettings;
    onAddPrescription: (prescription: Prescription) => Promise<void>;
    onDeletePrescription: (prescriptionId: string) => Promise<void>;
}

const DoctorPrescriptions: React.FC<DoctorPrescriptionsProps> = ({
    prescriptions,
    patients,
    doctorPatients,
    inventory,
    doctor,
    clinicSettings,
    onAddPrescription,
    onDeletePrescription
}) => {

    const [pdfData, setPdfData] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [prescriptionData, setPrescriptionData] = useState({
        patientId: '',
        items: [{ medicineName: '', dosage: '', frequency: '', quantity: 1, instructions: '' }]
    });
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    };

    const handleDownloadPdf = (prescription: Prescription) => {
        const patient = getPatient(prescription.patientId);
        if (patient) {
            setPdfData({ prescription, patient, doctor, clinicSettings });
        }
    };

    const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'patientId') {
            setPrescriptionData(prev => ({ ...prev, patientId: value }));
            const patient = doctorPatients.find(p => p.id === value);
            setSelectedPatient(patient || null);
        }
    };

    const handlePrescriptionItemChange = (index: number, field: string, value: string) => {
        setPrescriptionData(prev => {
            const updatedItems = [...prev.items];
            const isNumberField = ['quantity'].includes(field);
            updatedItems[index] = { ...updatedItems[index], [field]: isNumberField ? parseInt(value) || 0 : value };
            return { ...prev, items: updatedItems };
        });
    };

    const handleAddPrescriptionItem = () => {
        setPrescriptionData(prev => ({
            ...prev,
            items: [...prev.items, { medicineName: '', dosage: '', frequency: '', quantity: 1, instructions: '' }]
        }));
    };

    const handleRemovePrescriptionItem = (index: number) => {
        setPrescriptionData(prev => {
            const updatedItems = prev.items.filter((_, i) => i !== index);
            return {
                ...prev,
                items: updatedItems.length ? updatedItems : [{ medicineName: '', dosage: '', frequency: '', quantity: 1, instructions: '' }]
            };
        });
    };

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prescriptionData.patientId) {
            alert("Please select a patient.");
            return;
        }

        const validItems = prescriptionData.items.filter(item => item.medicineName.trim());
        if (validItems.length === 0) {
            alert("Please add at least one medicine.");
            return;
        }

        setIsSubmitting(true);
        try {
            const dateIssued = new Date().toISOString().split('T')[0];
            const createJobs = validItems.map(item => {
                const newPrescription: Prescription = {
                    id: `presc${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                    doctorId: doctor.id,
                    patientId: prescriptionData.patientId,
                    medicineName: item.medicineName,
                    dosage: item.dosage,
                    quantity: item.quantity,
                    frequency: item.frequency,
                    instructions: item.instructions,
                    dateIssued,
                    status: PrescriptionStatus.Issued,
                };
                return onAddPrescription(newPrescription);
            });
            await Promise.all(createJobs);
            setPrescriptionData({
                patientId: '',
                items: [{ medicineName: '', dosage: '', frequency: '', quantity: 1, instructions: '' }]
            });
            setSelectedPatient(null);
            setIsAddModalOpen(false);
            alert("Prescription issued successfully!");
        } catch (error) {
            console.error('Error issuing prescription:', error);
            alert("Failed to issue prescription. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePrescription = async (prescriptionId: string) => {
        const confirmed = window.confirm('Delete this prescription? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await onDeletePrescription(prescriptionId);
        } catch (error) {
            console.error('Error deleting prescription:', error);
            alert("Failed to delete prescription. Please try again.");
        }
    };

    return (
        <>
            <div className="fixed left-[-2000px] top-0 z-[-1]">
                {pdfData && <PrescriptionPDF {...pdfData} />}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-xl font-semibold text-slate-700 flex items-center">
                        <FilePlus className="mr-3 text-blue-600" />
                        Issued Prescriptions
                    </h3>
                    <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                        <Plus size={16} className="mr-2" />
                        Add Prescription
                    </button>
                </div>
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
                                            <button onClick={() => handleDeletePrescription(presc.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete Prescription">
                                                <MinusCircle size={18} />
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
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Prescription">
                <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600">Patient</label>
                        <select name="patientId" value={prescriptionData.patientId} onChange={handlePrescriptionChange} className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required>
                            <option value="">Select a patient</option>
                            {doctorPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {selectedPatient && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                <p className="font-semibold text-blue-800">Patient Details:</p>
                                <div className="grid grid-cols-2 gap-x-4 text-slate-700 mt-1">
                                    <p><span className="font-medium">Age:</span> {selectedPatient.age}</p>
                                    <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                                    <p className="col-span-2"><span className="font-medium">Contact:</span> {selectedPatient.phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        {prescriptionData.items.map((item, index) => (
                            <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50/40">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-slate-700">Medicine {index + 1}</p>
                                    <button type="button" onClick={() => handleRemovePrescriptionItem(index)} className="text-xs text-red-600 hover:text-red-700">
                                        Remove
                                    </button>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Medicine</label>
                                    <input
                                        list={`doctor-prescription-medicines-${index}`}
                                        type="text"
                                        value={item.medicineName}
                                        onChange={(e) => handlePrescriptionItemChange(index, 'medicineName', e.target.value)}
                                        placeholder="Search medicine..."
                                        className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        required
                                    />
                                    <datalist id={`doctor-prescription-medicines-${index}`}>
                                        {inventory.map(inv => <option key={inv.id} value={inv.name} />)}
                                    </datalist>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Dosage</label>
                                        <input
                                            type="text"
                                            value={item.dosage}
                                            onChange={(e) => handlePrescriptionItemChange(index, 'dosage', e.target.value)}
                                            placeholder="e.g., 500mg"
                                            className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handlePrescriptionItemChange(index, 'quantity', e.target.value)}
                                            className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="text-sm font-medium text-slate-600">Frequency</label>
                                    <input
                                        type="text"
                                        value={item.frequency}
                                        onChange={(e) => handlePrescriptionItemChange(index, 'frequency', e.target.value)}
                                        placeholder="e.g., Twice a day"
                                        className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    />
                                </div>
                                <div className="mt-3">
                                    <label className="text-sm font-medium text-slate-600">Instructions</label>
                                    <textarea
                                        value={item.instructions}
                                        onChange={(e) => handlePrescriptionItemChange(index, 'instructions', e.target.value)}
                                        placeholder="e.g., After meals"
                                        rows={2}
                                        className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddPrescriptionItem} className="w-full p-2.5 border border-dashed border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition">
                            + Add another medicine
                        </button>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700" disabled={isSubmitting}>
                            {isSubmitting ? 'Issuing...' : 'Issue Prescription'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default DoctorPrescriptions;
