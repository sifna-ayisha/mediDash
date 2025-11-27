import React from 'react';
import { Hospital } from 'lucide-react';
import { ClinicSettings, Prescription, Patient, Doctor } from '../../types';

interface PrescriptionPDFProps {
  prescription: Prescription;
  patient: Patient;
  doctor: Doctor;
  clinicSettings: ClinicSettings;
}

const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({ prescription, patient, doctor, clinicSettings }) => {
  return (
    <div id="print-area" className="flex justify-center bg-[#bdcfd9] py-8">
      <style>{`@media print { .print-sized { width:8.3in !important; height:11in !important; max-width:none !important; box-shadow:none !important; margin:0 auto !important; page-break-after:always; } body { background: white !important; } }`}</style>
      <div className="bg-white w-full max-w-[650px] shadow-md border rounded relative font-sans print-sized">

        {/* Top Header */}
        <div className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {clinicSettings.logo ? (
              <img src={clinicSettings.logo} alt="Clinic Logo" className="h-10 w-auto" />
            ) : (
              <Hospital size={32} className="text-white" />
            )}
            <div>
              <h1 className="text-lg font-bold uppercase">{clinicSettings.name}</h1>
              <p className="text-[10px]">
                {clinicSettings.address} {clinicSettings.phone && `, Phone: ${clinicSettings.phone}`}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="px-6 py-3">
          <p className="text-teal-700 font-bold text-lg">Dr. {doctor.name}</p>
          <p className="text-sm text-gray-700">{doctor.specialty}</p>
        </div>

        {/* Patient Details */}
        <div className="px-6 py-3 border-b border-gray-300">
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold">Patient Name:</p>
              <p>{patient.name}</p>
            </div>
            <div>
              <p className="font-semibold">Age:</p>
              <p>{patient.age}</p>
            </div>
            <div>
              <p className="font-semibold">Date:</p>
              <p>{prescription.dateIssued}</p>
            </div>
          </div>
        </div>

        {/* Prescription Section */}
        <div className="px-6 py-6 min-h-[230px] relative">
          <p className="text-teal-700 text-5xl font-bold mb-2">℞</p>

          <div className="ml-6 space-y-4">
            <div>
              <p className="font-bold text-lg text-gray-900">{prescription.medicineName}</p>
              <p className="text-sm font-semibold text-gray-700">Quantity: {prescription.quantity}</p>
            </div>

            <div className="text-sm text-gray-800 space-y-1">
              <p><span className="font-bold">Dosage:</span> {prescription.dosage}</p>
              <p><span className="font-bold">Frequency:</span> {prescription.frequency}</p>
              {prescription.instructions && (
                <p><span className="font-bold">Instructions:</span> {prescription.instructions}</p>
              )}
            </div>
          </div>

          {/* Background faint icon */}
          <div className="absolute top-14 right-10 opacity-10">
            <Hospital size={110} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-teal-700 px-6 py-2 text-white text-[10px] flex justify-between items-center">
          <p>{clinicSettings.phone && `Phone: +${clinicSettings.phone}`} </p>
          <p>{clinicSettings.address}</p>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionPDF;
