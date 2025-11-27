import React from 'react';
import { Hospital } from 'lucide-react';
import { ClinicSettings, Prescription, Patient, Doctor } from '../../types';

interface PharmacyInvoiceProps {
    prescription: Prescription;
    patient: Patient;
    doctor: Doctor;
    clinicSettings: ClinicSettings;
}

const PharmacyInvoice: React.FC<PharmacyInvoiceProps> = ({ prescription, patient, doctor, clinicSettings }) => {
    const subtotal = prescription.totalAmount || 0;
    const gstRate = clinicSettings.gstRate || 0;
    const gstAmount = (subtotal * gstRate) / 100;
    const grandTotal = subtotal + gstAmount;
    
    const unitPrice = prescription.quantity > 0 ? subtotal / prescription.quantity : 0;

    return (
        <div id="print-area">
            <div className="p-8 border-2 border-gray-400 rounded-lg max-w-2xl mx-auto my-10 font-sans bg-white shadow-lg">
                <header className="flex justify-between items-start pb-4 border-b-2 border-gray-300">
                    <div className="flex items-center">
                         {clinicSettings.logo ? (
                           <img src={clinicSettings.logo} alt="Clinic Logo" className="h-14 w-auto mr-4" />
                        ) : (
                           <Hospital size={40} className="text-primary mr-3" />
                        )}
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-gray-800">{clinicSettings.name}</h1>
                            <p className="text-xs text-gray-500 max-w-xs">{clinicSettings.address}</p>
                            <p className="text-xs text-gray-500">GSTIN: {clinicSettings.gstNumber}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="font-heading text-2xl font-bold text-gray-600">INVOICE</h2>
                        <p className="text-sm text-gray-500">#{prescription.id}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 my-6">
                    <div>
                        <h3 className="font-semibold text-gray-500 uppercase text-sm mb-2">Bill To</h3>
                        <p className="font-bold text-gray-800">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <div className="text-right">
                         <h3 className="font-semibold text-gray-500 uppercase text-sm mb-2">Details</h3>
                         <p className="text-sm text-gray-600"><span className="font-semibold">Date:</span> {prescription.dateFulfilled}</p>
                         <p className="text-sm text-gray-600"><span className="font-semibold">Prescribing Dr:</span> {doctor.name}</p>
                    </div>
                </section>

                <section className="mb-8">
                     <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase">
                                <tr>
                                    <th className="px-4 py-2 font-semibold">Item Description</th>
                                    <th className="px-4 py-2 font-semibold text-center">Qty</th>
                                    <th className="px-4 py-2 font-semibold text-right">Unit Price</th>
                                    <th className="px-4 py-2 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800">
                                <tr className="border-b border-gray-200">
                                    <td className="px-4 py-2 font-medium">{prescription.medicineName} ({prescription.dosage})</td>
                                    <td className="px-4 py-2 text-center">{prescription.quantity}</td>
                                    <td className="px-4 py-2 text-right">₹{unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-medium">₹{subtotal.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">GST ({gstRate}%):</span>
                            <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between border-t-2 border-gray-300 pt-2 mt-2 font-bold text-base">
                            <span className="text-gray-800">Grand Total:</span>
                            <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                 <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
                     <p className="text-sm text-gray-600">Thank you for your business!</p>
                     <p className="text-xs text-gray-400 mt-1">
                        {clinicSettings.name} | {clinicSettings.phone} | {clinicSettings.email}
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PharmacyInvoice;