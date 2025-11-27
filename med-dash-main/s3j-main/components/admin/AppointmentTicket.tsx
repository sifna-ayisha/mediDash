import React from 'react';
import { Hospital } from 'lucide-react';
import { ClinicSettings } from '../../types';

interface AppointmentTicketProps {
    appointment: any;
    clinicSettings: ClinicSettings;
}

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-200">
        <span className="font-semibold text-slate-600">{label}:</span>
        <span className="text-slate-800 text-right">{value ?? '—'}</span>
    </div>
);

const AppointmentTicket: React.FC<AppointmentTicketProps> = ({ appointment, clinicSettings }: AppointmentTicketProps) => {
    const fee = Number(appointment?.consultationFee ?? 0) || 0;
    const gstRate = Number(clinicSettings?.gstRate) || 0;
    const gstAmount = (fee * gstRate) / 100;
    const totalAmount = fee + gstAmount;

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

    const apptDate = appointment.date || appointment.datetime || '';
    const apptTime = appointment.time || '';

    return (
        <div id="print-area">
            <div className="p-6 md:p-8 border-2 border-slate-300 rounded-lg max-w-2xl mx-auto my-8 font-sans bg-white shadow-lg">
                <header className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0 pb-4 border-b-2 border-slate-300">
                    <div className="flex items-start">
                        {clinicSettings?.logo ? (
                            <img src={clinicSettings.logo} alt={`${clinicSettings.name || 'Clinic'} logo`} className="h-16 w-auto mr-4 object-contain" />
                        ) : (
                            <Hospital size={44} className="text-blue-600 mr-3" aria-hidden />
                        )}
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{clinicSettings?.name ?? 'Clinic'}</h1>
                            {clinicSettings?.address && (
                                <p className="text-xs text-slate-500 max-w-xs">{clinicSettings.address}</p>
                            )}
                            {clinicSettings?.gstNumber && (
                                <p className="text-xs text-slate-500">GSTIN: {clinicSettings.gstNumber}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-right md:text-right">
                        <h2 className="text-base md:text-lg font-bold text-slate-600">APPOINTMENT</h2>
                        <p className="text-xs text-slate-500 font-mono">#{appointment?.appointmentNumber ?? '—'}</p>
                    </div>
                </header>

                <section className="my-4 md:my-6">
                    <h3 className="font-semibold text-slate-500 uppercase text-sm mb-2">Appointment Details</h3>
                    <div className="space-y-1 text-xs">
                        <InfoRow label="Patient Name" value={appointment?.patientName} />
                        <InfoRow label="Age" value={appointment?.patientAge} />
                        <InfoRow label="Doctor" value={appointment?.doctorName} />
                        <InfoRow label="Department" value={appointment?.departmentName} />
                        <InfoRow label="Date & Time" value={`${apptDate}${apptTime ? ` at ${apptTime}` : ''}`} />
                        <InfoRow label="Reason" value={appointment?.reason || 'Not specified'} />
                    </div>
                </section>

                <section className="mt-6 pt-4 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-500 uppercase text-xs mb-2">Billing Details</h3>
                    <div className="w-full md:w-64 ml-auto space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Consultation Fee:</span>
                            <span className="font-medium text-slate-800">{formatCurrency(fee)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">GST ({gstRate}%):</span>
                            <span className="font-medium text-slate-800">{formatCurrency(gstAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-slate-300 pt-2 mt-2 font-bold text-base">
                            <span className="text-slate-800">Total Amount:</span>
                            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-8 pt-6 border-t border-slate-300 text-center">
                    <p className="text-xs text-slate-600">Thank you for choosing {clinicSettings?.name ?? 'our clinic'}!</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {clinicSettings?.phone ?? ''} {clinicSettings?.phone && clinicSettings?.email ? '|' : ''} {clinicSettings?.email ?? ''}
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AppointmentTicket;
