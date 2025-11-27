import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, Patient, Doctor, Department, AppointmentStatus, ClinicSettings, NotificationType, AvailabilitySlot, PaymentStatus, PaymentMode } from '../../types';
import { Plus, Search, Edit, Trash2, Printer, MessageSquare, Download, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import AppointmentTicket from './AppointmentTicket';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AppointmentsManagementProps {
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    patients: Patient[];
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
    doctors: Doctor[];
    departments: Department[];
    clinicSettings: ClinicSettings;
    addNotification: (type: NotificationType, message: string, linkTo: string) => void;
}

const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
        case AppointmentStatus.Completed: return 'bg-green-100 text-green-800 focus:ring-green-500';
        case AppointmentStatus.Cancelled: return 'bg-red-100 text-red-800 focus:ring-red-500';
        case AppointmentStatus.Scheduled: 
        default:
            return 'bg-blue-100 text-blue-800 focus:ring-blue-500';
    }
}

const getPaymentStatusColor = (status?: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-100 text-green-800 focus:ring-green-500';
        case PaymentStatus.Unpaid: return 'bg-red-100 text-red-800 focus:ring-red-500';
        default: return 'bg-slate-100 text-slate-800 focus:ring-slate-500';
    }
}

const AppointmentForm: React.FC<{ 
    appointment?: Appointment | null; 
    patients: Patient[]; 
    doctors: Doctor[]; 
    departments: Department[]; 
    onSave: (appointment: Appointment, isNewPatient: boolean, patientData: Patient | Partial<Patient>) => void; 
    onCancel: () => void 
}> = ({ appointment, patients, doctors, departments, onSave, onCancel }) => {
    
    const [isNewPatient, setIsNewPatient] = useState(false);
    const [newPatientData, setNewPatientData] = useState<Omit<Patient, 'id' | 'address' | 'admitDate' | 'dischargeDate' | 'roomNumber'>>({
        name: '', age: 0, gender: 'Other', email: '', phone: '', whatsappNumber: ''
    });

    const [formData, setFormData] = useState<Omit<Appointment, 'appointmentNumber'>>({ 
        id: appointment?.id || '',
        patientId: appointment?.patientId || '', 
        doctorId: appointment?.doctorId || '', 
        departmentId: appointment?.departmentId || '', 
        date: appointment?.date || '', 
        time: appointment?.time || '', 
        reason: appointment?.reason || '',
        status: appointment?.status || AppointmentStatus.Scheduled,
        consultationFee: appointment?.consultationFee || 0,
        paymentStatus: appointment?.paymentStatus || PaymentStatus.Unpaid,
        paymentMode: appointment?.paymentMode || PaymentMode.NotApplicable,
    });

    const [availabilityMessage, setAvailabilityMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const daysOfWeek: AvailabilitySlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        if (formData.date && formData.time && formData.doctorId) {
            const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
            if (!selectedDoctor || !selectedDoctor.availability || selectedDoctor.availability.length === 0) {
                setAvailabilityMessage({ text: 'Doctor has not set their availability.', type: 'error' });
                return;
            }

            const selectedDate = new Date(`${formData.date}T00:00:00`);
            const dayOfWeek = daysOfWeek[selectedDate.getUTCDay()];

            const slotsForDay = selectedDoctor.availability.filter(slot => slot.day === dayOfWeek);

            if (slotsForDay.length === 0) {
                setAvailabilityMessage({ text: `Doctor is not available on ${dayOfWeek}s.`, type: 'error' });
                return;
            }

            const isAvailable = slotsForDay.some(slot => 
                formData.time >= slot.startTime && formData.time < slot.endTime
            );

            if (isAvailable) {
                setAvailabilityMessage({ text: `Doctor is available at this time.`, type: 'success' });
            } else {
                const availableSlots = slotsForDay.map(s => `${s.startTime}-${s.endTime}`).join(', ');
                setAvailabilityMessage({ text: `Not available. Available slots on ${dayOfWeek}s: ${availableSlots}`, type: 'error' });
            }
        } else {
            setAvailabilityMessage(null);
        }
    }, [formData.date, formData.time, formData.doctorId, doctors]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['consultationFee'].includes(name);
        setFormData(prev => {
            const newState = { ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value };
            if (name === 'paymentStatus' && value === PaymentStatus.Unpaid) {
                newState.paymentMode = PaymentMode.NotApplicable;
            }
             if (name === 'paymentStatus' && value === PaymentStatus.Paid && prev.paymentStatus === PaymentStatus.Unpaid) {
                newState.paymentMode = PaymentMode.Cash; // Default to cash
            }
            return newState;
        });
    };

    const handleNewPatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewPatientData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (availabilityMessage?.type === 'error') {
            alert(`Cannot save appointment. Reason: ${availabilityMessage.text}`);
            return;
        }

        if (isNewPatient) {
            const fullNewPatientData: Patient = {
                id: `pat${Date.now()}`,
                ...newPatientData,
                address: '', // Default address to empty
                admitDate: '',
                dischargeDate: '',
                roomNumber: '',
            };
            const appointmentData: Appointment = {
                ...formData,
                id: `apt${Date.now()}`,
                patientId: fullNewPatientData.id,
                appointmentNumber: `APT-${Math.floor(Date.now() / 1000)}`
            };
            onSave(appointmentData, true, fullNewPatientData);
        } else {
            const appointmentData: Appointment = {
                ...formData,
                id: formData.id || `apt${Date.now()}`,
                appointmentNumber: appointment?.appointmentNumber || `APT-${Math.floor(Date.now() / 1000)}`
            };
            onSave(appointmentData, false, {});
        }
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Department</label>
                    <select name="departmentId" value={formData.departmentId} onChange={handleChange} className={commonInputClass} required>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Doctor</label>
                    <select name="doctorId" value={formData.doctorId} onChange={handleChange} className={commonInputClass} required>
                        <option value="">Select Doctor</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Time</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} className={commonInputClass} required />
                </div>
            </div>
             {availabilityMessage && (
                <div className={`mt-2 text-xs p-2 rounded-lg ${availabilityMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {availabilityMessage.text}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700">Patient</label>
                <div className="flex flex-wrap sm:flex-nowrap items-center mt-1 gap-2">
                    <div className="flex-grow w-full sm:w-auto">
                        {isNewPatient ? (
                            <input
                                type="text"
                                name="name"
                                value={newPatientData.name}
                                onChange={handleNewPatientChange}
                                placeholder="New Patient Name"
                                className={commonInputClass}
                                required
                            />
                        ) : (
                            <select name="patientId" value={formData.patientId} onChange={handleChange} className={commonInputClass} required>
                                <option value="">Select Patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        )}
                    </div>
                    <label htmlFor="isNewPatient" className="flex items-center space-x-2 cursor-pointer text-sm text-slate-600 whitespace-nowrap">
                        <input 
                            id="isNewPatient"
                            type="checkbox" 
                            checked={isNewPatient} 
                            onChange={e => setIsNewPatient(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                            disabled={!!appointment}
                        />
                        <span>New Patient</span>
                    </label>
                </div>
            </div>

            {isNewPatient && (
                <div className="p-4 bg-slate-50 rounded-lg space-y-4 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-600">New Patient Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Age</label>
                            <input type="number" name="age" value={newPatientData.age} onChange={handleNewPatientChange} className={commonInputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Gender</label>
                            <select name="gender" value={newPatientData.gender} onChange={handleNewPatientChange} className={commonInputClass} required>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" value={newPatientData.email} onChange={handleNewPatientChange} className={commonInputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone</label>
                            <input type="tel" name="phone" value={newPatientData.phone} onChange={handleNewPatientChange} className={commonInputClass} required pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">WhatsApp Number (Preferred)</label>
                            <input type="tel" name="whatsappNumber" value={newPatientData.whatsappNumber} onChange={handleNewPatientChange} className={commonInputClass} pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210" />
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Reason for Visit</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} className={commonInputClass} />
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Consultation Fee (₹)</label>
                        <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className={commonInputClass} required min="0" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                            <label className="block text-sm font-medium text-slate-700">Payment Status</label>
                            <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className={commonInputClass} required>
                                {Object.values(PaymentStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Payment Mode</label>
                            <select 
                                name="paymentMode" 
                                value={formData.paymentMode} 
                                onChange={handleChange} 
                                className={`${commonInputClass} disabled:bg-slate-100`}
                                required
                                disabled={formData.paymentStatus === PaymentStatus.Unpaid}
                            >
                                {Object.values(PaymentMode).filter(mode => mode !== PaymentMode.NotApplicable).map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={commonInputClass} required>
                    {Object.values(AppointmentStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    disabled={availabilityMessage?.type === 'error'}
                >
                    Save Appointment
                </button>
            </div>
        </form>
    );
};

const AppointmentsManagement: React.FC<AppointmentsManagementProps> = ({ appointments, setAppointments, patients, setPatients, doctors, departments, clinicSettings, addNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [ticketData, setTicketData] = useState<any>(null);

    const handlePrint = () => {
        window.print();
        setTicketData(null);
    };

    const handleDownload = () => {
        const ticketElement = document.getElementById('print-area');
        if (ticketElement) {
            html2canvas(ticketElement, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Appointment-${ticketData.appointment.appointmentNumber}.pdf`);
            }).finally(() => setTicketData(null));
        }
    };

    useEffect(() => {
        if (ticketData?.action === 'print') {
            const timer = setTimeout(handlePrint, 100);
            return () => clearTimeout(timer);
        }
        if (ticketData?.action === 'download') {
            const timer = setTimeout(handleDownload, 100);
            return () => clearTimeout(timer);
        }
    }, [ticketData]);

    const handleSave = (appointment: Appointment, isNewPatient: boolean, patientData: Patient | Partial<Patient>) => {
        if (editingAppointment) {
            setAppointments(appointments.map(a => a.id === appointment.id ? appointment : a));
        } else {
            if (isNewPatient) {
                setPatients(prev => [...prev, patientData as Patient]);
            }
            setAppointments(prev => [appointment, ...prev]);
            const patientName = isNewPatient ? (patientData as Patient).name : patients.find(p => p.id === appointment.patientId)?.name;
            addNotification(NotificationType.NewAppointment, `New appointment for ${patientName}.`, 'Appointments');
        }
        setIsModalOpen(false);
        setEditingAppointment(null);
    };
    
    const handleStatusChange = (appointmentId: string, status: AppointmentStatus) => {
        setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status } : apt));
    };

    const handlePaymentStatusChange = (appointmentId: string, paymentStatus: PaymentStatus) => {
        setAppointments(prev => prev.map(apt => {
            if (apt.id === appointmentId) {
                if (paymentStatus === PaymentStatus.Unpaid) {
                    return { ...apt, paymentStatus, paymentMode: PaymentMode.NotApplicable };
                }
                if (paymentStatus === PaymentStatus.Paid && apt.paymentStatus === PaymentStatus.Unpaid) {
                     return { ...apt, paymentStatus, paymentMode: PaymentMode.Cash };
                }
                return { ...apt, paymentStatus };
            }
            return apt;
        }));
    };

     const handlePaymentModeChange = (appointmentId: string, paymentMode: PaymentMode) => {
        setAppointments(prev => prev.map(apt => 
            apt.id === appointmentId ? { ...apt, paymentMode } : apt
        ));
    };

    const handleFeeChange = (appointmentId: string, fee: number) => {
        setAppointments(prev => prev.map(apt => 
            apt.id === appointmentId ? { ...apt, consultationFee: fee } : apt
        ));
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            setAppointments(appointments.filter(a => a.id !== id));
        }
    };

    const handleSendConfirmation = (appointmentId: string) => {
        setAppointments(prev => prev.map(apt => 
            apt.id === appointmentId ? { ...apt, whatsappConfirmationSent: true } : apt
        ));
    };
    
    const appointmentsWithDetails = useMemo(() => {
        return appointments.map(apt => {
            const patient = patients.find(p => p.id === apt.patientId);
            const doctor = doctors.find(d => d.id === apt.doctorId);
            return {
                ...apt,
                patientName: patient?.name || 'N/A',
                patientAge: patient?.age,
                doctorName: doctor?.name || 'N/A',
                doctorSpecialty: doctor?.specialty || 'N/A',
                departmentName: departments.find(d => d.id === apt.departmentId)?.name || 'N/A',
                whatsappNumber: patient?.whatsappNumber
            }
        });
    }, [appointments, patients, doctors, departments]);

    const filteredAppointments = useMemo(() => 
        appointmentsWithDetails.filter(apt => 
            apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [appointmentsWithDetails, searchTerm]
    );

    return (
        <>
            <div className="fixed left-[-2000px] top-0 z-[-1]">
              {ticketData && <AppointmentTicket appointment={ticketData.appointment} clinicSettings={clinicSettings} />}
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="font-heading text-xl font-semibold text-slate-700">Manage Appointments</h3>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search appointments..." 
                                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                            <Plus size={16} className="mr-2" />
                            <span>Add New</span>
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-sm text-slate-700 bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Appt. No.</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Patient</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Doctor</th>
                                <th scope="col" className="px-6 py-4 font-semibold hidden sm:table-cell">Date & Time</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Fee (₹)</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Payment</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Mode</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredAppointments.map(apt => {
                                const message = `*Appointment Confirmation*\nHello ${apt.patientName},\n\nThis is a confirmation for your upcoming appointment.\n\n*Appointment ID:* ${apt.appointmentNumber}\n*Doctor:* ${apt.doctorName}\n*Date:* ${apt.date}\n*Time:* ${apt.time}\n\nThank you,\n${clinicSettings.name}`;
                                const encodedMessage = encodeURIComponent(message);
                                const confirmationUrl = `https://wa.me/91${apt.whatsappNumber}?text=${encodedMessage}`;

                                return (
                                <tr key={apt.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-5 font-mono text-slate-800 hidden md:table-cell">{apt.appointmentNumber}</td>
                                    <td className="px-6 py-5 font-medium text-slate-900">{apt.patientName}</td>
                                    <td className="px-6 py-5">{apt.doctorName}</td>
                                    <td className="px-6 py-5 hidden sm:table-cell">{apt.date} at {apt.time}</td>
                                    <td className="px-6 py-5">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                value={apt.consultationFee}
                                                onChange={(e) => handleFeeChange(apt.id, parseFloat(e.target.value) || 0)}
                                                className="w-24 pl-5 pr-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <select
                                            value={apt.paymentStatus || PaymentStatus.Unpaid}
                                            onChange={(e) => handlePaymentStatusChange(apt.id, e.target.value as PaymentStatus)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer focus:outline-none focus:ring-2 ${getPaymentStatusColor(apt.paymentStatus)}`}
                                        >
                                            {Object.values(PaymentStatus).map(status => (
                                                <option key={status} value={status} className="bg-white text-slate-800">{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                     <td className="px-6 py-5">
                                        {apt.paymentStatus === PaymentStatus.Paid ? (
                                            <select
                                                value={apt.paymentMode || PaymentMode.Cash}
                                                onChange={(e) => handlePaymentModeChange(apt.id, e.target.value as PaymentMode)}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer focus:outline-none focus:ring-2 ${getPaymentStatusColor(apt.paymentStatus)}`}
                                            >
                                                {Object.values(PaymentMode)
                                                    .filter(mode => mode !== PaymentMode.NotApplicable)
                                                    .map(mode => (
                                                        <option key={mode} value={mode} className="bg-white text-slate-800">{mode}</option>
                                                    ))
                                                }
                                            </select>
                                        ) : (
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(apt.paymentStatus)}`}>
                                                {PaymentMode.NotApplicable}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <select
                                            value={apt.status}
                                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer focus:outline-none focus:ring-2 ${getStatusColor(apt.status)}`}
                                        >
                                            {Object.values(AppointmentStatus).map(status => (
                                                <option key={status} value={status} className="bg-white text-slate-800">{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex justify-center items-center">
                                            {apt.whatsappNumber && (
                                                 <a 
                                                    href={confirmationUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    onClick={(e) => {
                                                        if (apt.whatsappConfirmationSent) {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        handleSendConfirmation(apt.id)
                                                    }}
                                                    className={`p-2 rounded-full ${apt.whatsappConfirmationSent ? 'text-slate-400' : 'text-green-500 hover:bg-green-100'}`}
                                                    title={apt.whatsappConfirmationSent ? "Confirmation Sent" : "Send Confirmation"}
                                                >
                                                    {apt.whatsappConfirmationSent ? <CheckCircle size={18} /> : <MessageSquare size={18} />}
                                                </a>
                                            )}
                                            <button onClick={() => setTicketData({ action: 'print', appointment: apt })} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Print Ticket"><Printer size={18} /></button>
                                            <button onClick={() => setTicketData({ action: 'download', appointment: apt })} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Download Ticket"><Download size={18} /></button>
                                            <button onClick={() => { setEditingAppointment(apt); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(apt.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAppointment(null);}} title={editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}>
                    <AppointmentForm appointment={editingAppointment} patients={patients} doctors={doctors} departments={departments} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingAppointment(null); }} />
                </Modal>
            </div>
        </>
    );
};

export default AppointmentsManagement;