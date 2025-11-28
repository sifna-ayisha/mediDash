import React, { useMemo } from 'react';
import { Patient, Appointment, Prescription, LabReport, Doctor, ClinicSettings } from '../../types';
import Card from '../common/Card';
import { Calendar, FilePlus, TestTube2, Clock } from 'lucide-react';
import PatientAppointments from '../patient/PatientAppointments';
import PatientPrescriptions from '../patient/PatientPrescriptions';
import PatientLabReports from '../patient/PatientLabReports';
import PatientProfile from '../patient/PatientProfile';

interface PatientDashboardProps {
    activeView: string;
    patient?: Patient;
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
    appointments: Appointment[];
    prescriptions: Prescription[];
    labReports: LabReport[];
    doctors: Doctor[];
    clinicSettings: ClinicSettings;
}

const DashboardView: React.FC<{
    patient: Patient;
    appointments: Appointment[];
    prescriptions: Prescription[];
    labReports: LabReport[];
    doctors: Doctor[];
}> = ({ patient, appointments, prescriptions, labReports, doctors }) => {

    const upcomingAppointments = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return appointments
            .filter(apt => new Date(apt.date) >= today)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [appointments]);

    return (
        <div className="space-y-8">
            <h2 className="font-heading text-2xl font-bold text-gray-800">Welcome, {patient.name}!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Upcoming Appointments" value={upcomingAppointments.length.toString()} icon="Calendar" color="blue" />
                <Card title="Total Prescriptions" value={prescriptions.length.toString()} icon="FilePlus" color="green" />
                <Card title="Lab Reports Ready" value={labReports.filter(lr => lr.status === 'Completed').length.toString()} icon="TestTube2" color="violet" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <Calendar className="mr-2 text-primary" size={20} />
                    Your Upcoming Appointments
                </h3>
                <div className="space-y-4">
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="flex items-center p-4 bg-primary-light rounded-xl">
                            <div className="bg-primary text-white rounded-lg p-2 mr-4">
                                <Clock size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{new Date(apt.date).toDateString()} at {apt.time}</p>
                                <p className="text-sm text-gray-600">With <span className="font-medium">{doctors.find(d => d.id === apt.doctorId)?.name}</span> for {apt.reason}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4">You have no upcoming appointments.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const PatientDashboard: React.FC<PatientDashboardProps> = (props) => {
    const { activeView, patient, setPatients, appointments, prescriptions, labReports, doctors, clinicSettings } = props;

    if (!patient) {
        return <div className="text-center p-8 bg-white rounded-2xl shadow-sm">Patient data not found. Please log in again.</div>;
    }

    const handleUpdatePatient = (updatedPatient: Patient) => {
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        alert('Profile updated successfully!');
    }

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard':
                return <DashboardView patient={patient} appointments={appointments} prescriptions={prescriptions} labReports={labReports} doctors={doctors} />;
            case 'Appointments':
                return <PatientAppointments appointments={appointments} doctors={doctors} />;
            case 'Prescriptions':
                return <PatientPrescriptions prescriptions={prescriptions} doctors={doctors} />;
            case 'Lab Reports':
                return <PatientLabReports reports={labReports} doctors={doctors} clinicSettings={clinicSettings} />;
            case 'Profile':
                return <PatientProfile patient={patient} onUpdatePatient={handleUpdatePatient} />;
            default:
                return <DashboardView patient={patient} appointments={appointments} prescriptions={prescriptions} labReports={labReports} doctors={doctors} />;
        }
    }

    return (
        <div>
            {renderContent()}
        </div>
    );
};

export default PatientDashboard;