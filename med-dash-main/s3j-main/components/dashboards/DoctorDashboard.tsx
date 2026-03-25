import React, { useMemo, useState } from 'react';
import { Calendar, FilePlus, Beaker, Clock, User, Mail, Phone, Users, TestTube2 } from 'lucide-react';
import { Doctor, Appointment, Patient, InventoryItem, Prescription, PrescriptionStatus, ClinicSettings, LabReport, LabReportStatus, SampleStatus, PaymentStatus, LeaveRequest } from '../../types';
import ProfileSettings from '../doctor/ProfileSettings';
import DoctorSchedule from '../doctor/DoctorSchedule';
import DoctorPatients from '../doctor/DoctorPatients';
import DoctorPrescriptions from '../doctor/DoctorPrescriptions';
import DoctorLabReports from '../doctor/DoctorLabReports';
import DoctorAvailability from '../doctor/DoctorAvailability';
import DoctorLeaves from '../doctor/DoctorLeaves';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { api } from '../../api';

const DashboardView: React.FC<{
  doctor: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  inventory: InventoryItem[];
  labReports: LabReport[];
  onAddPrescription: (prescription: Prescription) => Promise<void>;
  onAddLabReport: (report: LabReport) => void;
}> = ({ doctor, appointments, patients, inventory, labReports, onAddPrescription, onAddLabReport }) => {

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: '',
    items: [{ medicineName: '', dosage: '', frequency: '', quantity: 1, instructions: '' }]
  });
  const [labTestData, setLabTestData] = useState({ patientId: '', testName: '', testFee: 0 });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedLabPatient, setSelectedLabPatient] = useState<Patient | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = useMemo(() => 
    appointments.filter(apt => apt.doctorId === doctor.id && apt.date === today), 
    [appointments, doctor.id, today]
  );

  const doctorPatientIds = useMemo(() => 
    [...new Set(appointments.filter(a => a.doctorId === doctor.id).map(a => a.patientId))],
    [appointments, doctor.id]
  );

  const doctorPatients = useMemo(() => 
    patients.filter(p => doctorPatientIds.includes(p.id)),
    [patients, doctorPatientIds]
  );
  
  const completedLabReports = useMemo(() => 
      labReports.filter(lr => doctorPatientIds.includes(lr.patientId) && lr.status === LabReportStatus.Completed),
      [labReports, doctorPatientIds]
  );

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
      setIsPrescriptionModalOpen(false);
      alert("Prescription issued successfully!");
    } catch (error) {
      console.error('Error issuing prescription:', error);
      alert("Failed to issue prescription. Please try again.");
    }
  };

  const handleLabTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labTestData.patientId || !labTestData.testName) {
      alert("Please select a patient and enter a test name.");
      return;
    }
    const newLabReport: LabReport = {
      id: `lab${Date.now()}`,
      reportId: `LAB-RPT-${Math.floor(Date.now() / 1000)}`,
      patientId: labTestData.patientId,
      doctorId: doctor.id,
      testName: labTestData.testName,
      parameters: [],
      resultSummary: 'Pending sample collection.',
      reportDate: new Date().toISOString().split('T')[0],
      status: LabReportStatus.Pending,
      sampleId: `SMPL-${Math.floor(Date.now() / 1000)}`,
      sampleStatus: SampleStatus.Collected,
      testFee: labTestData.testFee,
      paymentStatus: PaymentStatus.Unpaid,
    };
    onAddLabReport(newLabReport);
    setLabTestData({ patientId: '', testName: '', testFee: 0 });
    setSelectedLabPatient(null);
    setIsLabModalOpen(false);
    alert("Lab test requested successfully!");
  }

  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'patientId') {
      setPrescriptionData(prev => ({ ...prev, patientId: value }));
      const patient = patients.find(p => p.id === value);
      setSelectedPatient(patient || null);
      return;
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
      return { ...prev, items: updatedItems.length ? updatedItems : [{ medicineName: '', dosage: '', frequency: '', quantity: 1, instructions: '' }] };
    });
  };
  
  const handleLabTestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const isNumberField = ['testFee'].includes(name);
      setLabTestData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value}));
      
      if (name === 'patientId') {
          const patient = patients.find(p => p.id === value);
          setSelectedLabPatient(patient || null);
      }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                 <Card title="Appointments Today" value={todaysAppointments.length.toString()} icon="Calendar" color="blue" />
                 <Card title="My Patients" value={doctorPatients.length.toString()} icon="Users" color="violet" />
                 <Card title="Lab Reports Ready" value={completedLabReports.length.toString()} icon="TestTube2" color="green" />
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
            <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-600" size={20} />
                Today's Schedule
            </h3>
            <div className="space-y-4">
                {todaysAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                             <thead className="text-sm text-slate-700 bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-semibold">Time</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Patient</th>
                                    <th scope="col" className="px-4 py-3 font-semibold hidden sm:table-cell">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {todaysAppointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4 font-semibold text-blue-600">{apt.time}</td>
                                    <td className="px-4 py-4 font-medium text-slate-800">{patients.find(p => p.id === apt.patientId)?.name}</td>
                                    <td className="px-4 py-4 hidden sm:table-cell">{apt.reason}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                <p className="text-center text-slate-500 py-4">No appointments scheduled for today.</p>
                )}
            </div>
            </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                 <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Quick Actions</h3>
                 <div className="space-y-3">
                     <button onClick={() => setIsPrescriptionModalOpen(true)} className="w-full flex items-center p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition">
                        <FilePlus size={20} className="mr-3 text-green-600" />
                        <span className="font-semibold">New Prescription</span>
                     </button>
                     <button onClick={() => setIsLabModalOpen(true)} className="w-full flex items-center p-3 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition">
                        <Beaker size={20} className="mr-3 text-violet-600" />
                        <span className="font-semibold">Request Lab Test</span>
                     </button>
                 </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
            <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <User className="mr-2 text-slate-600" size={20} />
                Contact Information
            </h3>
            <div className="space-y-3 text-sm">
                <div className="flex items-center">
                <Mail size={16} className="text-slate-500 mr-3 shrink-0" />
                <a href={`mailto:${doctor.email}`} className="text-slate-700 hover:text-blue-600 hover:underline truncate">{doctor.email}</a>
                </div>
                <div className="flex items-center">
                <Phone size={16} className="text-slate-500 mr-3 shrink-0" />
                <a href={`tel:${doctor.phone}`} className="text-slate-700 hover:text-blue-600 hover:underline">{doctor.phone}</a>
                </div>
            </div>
            </div>
        </div>
      </div>

       <Modal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} title="New Prescription">
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
                            list={`medicines-${index}`}
                            type="text"
                            value={item.medicineName}
                            onChange={(e) => handlePrescriptionItemChange(index, 'medicineName', e.target.value)}
                            placeholder="Search medicine..."
                            className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            required
                          />
                          <datalist id={`medicines-${index}`}>
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
                     <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                     <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Issue Prescription</button>
                </div>
            </form>
       </Modal>
       
       <Modal isOpen={isLabModalOpen} onClose={() => setIsLabModalOpen(false)} title="Request Lab Test">
            <form onSubmit={handleLabTestSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-600">Patient</label>
                    <select name="patientId" value={labTestData.patientId} onChange={handleLabTestChange} className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none transition" required>
                        <option value="">Select a patient</option>
                        {doctorPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                     {selectedLabPatient && (
                        <div className="mt-2 p-3 bg-violet-50 border border-violet-200 rounded-lg text-sm">
                            <p className="font-semibold text-violet-800">Patient Details:</p>
                            <div className="grid grid-cols-2 gap-x-4 text-slate-700 mt-1">
                                <p><span className="font-medium">Age:</span> {selectedLabPatient.age}</p>
                                <p><span className="font-medium">Gender:</span> {selectedLabPatient.gender}</p>
                                <p className="col-span-2"><span className="font-medium">Contact:</span> {selectedLabPatient.phone}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600">Test Name</label>
                        <input type="text" name="testName" value={labTestData.testName} onChange={handleLabTestChange} placeholder="e.g., Blood Sugar Test" className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none transition" required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-600">Test Fee (₹)</label>
                        <input type="number" name="testFee" value={labTestData.testFee} onChange={handleLabTestChange} placeholder="e.g., 500" className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none transition" required min="0"/>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                     <button type="button" onClick={() => setIsLabModalOpen(false)} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                     <button type="submit" className="px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700">Submit Request</button>
                </div>
            </form>
       </Modal>
    </>
  );
};

interface DoctorDashboardProps {
  activeView: string;
  doctor?: Doctor;
  onUpdateDoctor: (doctor: Doctor) => void;
  appointments: Appointment[];
  patients: Patient[];
  inventory: InventoryItem[];
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  clinicSettings: ClinicSettings;
  labReports: LabReport[];
  setLabReports: React.Dispatch<React.SetStateAction<LabReport[]>>;
  doctors: Doctor[];
  leaveRequests: LeaveRequest[];
  onApplyLeave: (request: LeaveRequest) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  activeView, 
  doctor, 
  onUpdateDoctor, 
  appointments,
  patients,
  inventory,
  prescriptions,
  setPrescriptions,
  clinicSettings,
  labReports,
  setLabReports,
  doctors,
  leaveRequests,
  onApplyLeave
}) => {
  
  if (!doctor) {
    return <div className="text-center p-8 bg-white rounded-2xl shadow-sm">Doctor data not found.</div>;
  }

  const handleAddPrescription = async (prescription: Prescription) => {
    try {
      const created = await api.createPrescription(prescription);
      setPrescriptions(prev => [created, ...prev]);
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      await api.deletePrescription(prescriptionId);
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  };
  
  const handleAddLabReport = (report: LabReport) => {
    setLabReports(prev => [report, ...prev]);
  };

  const doctorAppointments = useMemo(() => 
    appointments.filter(a => a.doctorId === doctor.id),
    [appointments, doctor.id]
  );
  
  const doctorPatientIds = useMemo(() => 
    [...new Set(doctorAppointments.map(a => a.patientId))],
    [doctorAppointments]
  );

  const doctorPatients = useMemo(() => 
    patients.filter(p => doctorPatientIds.includes(p.id)),
    [patients, doctorPatientIds]
  );
  
  const doctorPrescriptions = useMemo(() =>
    prescriptions.filter(p => p.doctorId === doctor.id),
    [prescriptions, doctor.id]
  );

  const doctorLabReports = useMemo(() => 
    labReports.filter(report => doctorPatientIds.includes(report.patientId)),
    [labReports, doctorPatientIds]
  );

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardView 
          doctor={doctor} 
          appointments={appointments} 
          patients={patients}
          inventory={inventory}
          labReports={labReports}
          onAddPrescription={handleAddPrescription}
          onAddLabReport={handleAddLabReport}
        />;
      case 'Schedule':
        return <DoctorSchedule appointments={doctorAppointments} patients={patients} />;
      case 'Availability':
        return <DoctorAvailability doctor={doctor} onUpdateDoctor={onUpdateDoctor} />;
      case 'Leaves':
        return <DoctorLeaves doctor={doctor} leaveRequests={leaveRequests} onApplyLeave={onApplyLeave} />;
      case 'Patients':
        return <DoctorPatients patients={doctorPatients} />;
      case 'Prescriptions':
        return <DoctorPrescriptions 
            prescriptions={doctorPrescriptions} 
            patients={patients} 
            doctorPatients={doctorPatients}
            inventory={inventory}
            doctor={doctor}
            clinicSettings={clinicSettings}
            onAddPrescription={handleAddPrescription}
            onDeletePrescription={handleDeletePrescription}
        />;
      case 'Lab Reports':
        return <DoctorLabReports 
            reports={doctorLabReports}
            patients={doctorPatients}
            clinicSettings={clinicSettings} 
            doctors={doctors}
        />;
      case 'Settings':
        return <ProfileSettings doctor={doctor} onUpdateDoctor={onUpdateDoctor} />;
      default:
        return <DashboardView 
          doctor={doctor} 
          appointments={appointments} 
          patients={patients}
          inventory={inventory}
          labReports={labReports}
          onAddPrescription={handleAddPrescription}
          onAddLabReport={handleAddLabReport}
        />;
    }
  }

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default DoctorDashboard;
