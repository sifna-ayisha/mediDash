import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Card from '../common/Card';
import { Doctor, Patient, Department, Appointment, LabReport, InventoryItem, ClinicSettings, Notification, NotificationType, Prescription, LeaveRequest, LeaveStatus } from '../../types';
import DoctorsManagement from '../admin/DoctorsManagement';
import PatientsManagement from '../admin/PatientsManagement';
import DepartmentsManagement from '../admin/DepartmentsManagement';
import AppointmentsManagement from '../admin/AppointmentsManagement';
import LabReportsManagement from '../admin/LabReportsManagement';
import PharmacyManagement from '../admin/PharmacyManagement';
import LeavesManagement from '../admin/LeavesManagement';
import Reports from '../admin/Reports';
import Settings from '../admin/Settings';

const patientsData = [
  { name: 'Cardiology', patients: 65 },
  { name: 'Neurology', patients: 42 },
  { name: 'Oncology', patients: 35 },
  { name: 'Pediatrics', patients: 88 },
  { name: 'Orthopedics', patients: 54 },
  { name: 'Urology', patients: 29 },
];

const incomeData = [
  { name: 'Jan', income: 45000 },
  { name: 'Feb', income: 42000 },
  { name: 'Mar', income: 55000 },
  { name: 'Apr', income: 62000 },
  { name: 'May', income: 71000 },
  { name: 'Jun', income: 68000 },
];

const DashboardView: React.FC<{ appointments: Appointment[], patients: Patient[], doctors: Doctor[], departments: Department[] }> = ({ appointments, patients, doctors, departments }) => (
    <div className="space-y-6 md:space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card title="Total Patients" value={patients.length.toString()} icon="Users" color="blue" change="+12% this month" />
        <Card title="Appointments Today" value="128" icon="Calendar" color="violet" />
        <Card title="Total Revenue" value="₹1.2M" icon="IndianRupee" color="green" change="+8% this month" />
        <Card title="Active Doctors" value={doctors.length.toString()} icon="Stethoscope" color="red" />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        <div className="lg:col-span-3 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
          <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Patients per Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
              <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
              <Tooltip 
                cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} 
                contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}} 
              />
              <Bar dataKey="patients" fill="url(#colorPatients)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
          <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Monthly Income</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={incomeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
              <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={(value) => `₹${Number(value)/1000}k`} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}} 
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Area type="monotone" dataKey="income" stroke="#7c3aed" fill="url(#colorIncome)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
       {/* Recent Appointments Table */}
       <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
        <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Recent Appointments</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-sm text-slate-700 bg-slate-100">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-semibold">Patient</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Doctor</th>
                        <th scope="col" className="px-6 py-4 font-semibold hidden sm:table-cell">Department</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {appointments.slice(0, 4).map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50">
                            <td className="px-6 py-5 font-medium text-slate-900">{patients.find(p => p.id === apt.patientId)?.name}</td>
                            <td className="px-6 py-5">{doctors.find(d => d.id === apt.doctorId)?.name}</td>
                            <td className="px-6 py-5 hidden sm:table-cell">{departments.find(d => d.id === apt.departmentId)?.name}</td>
                            <td className="px-6 py-5">{apt.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
);


interface AdminDashboardProps {
    activeView: string;
    doctors: Doctor[];
    setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
    patients: Patient[];
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    labReports: LabReport[];
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    clinicSettings: ClinicSettings;
    setClinicSettings: React.Dispatch<React.SetStateAction<ClinicSettings>>;
    addNotification: (type: NotificationType, message: string, linkTo: string) => void;
    prescriptions: Prescription[];
    leaveRequests: LeaveRequest[];
    onUpdateLeaveStatus: (id: string, status: LeaveStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { 
        activeView, 
        doctors, setDoctors, 
        patients, setPatients, 
        departments, setDepartments, 
        appointments, setAppointments,
        labReports,
        inventory, setInventory,
        clinicSettings, setClinicSettings,
        addNotification,
        prescriptions,
        leaveRequests,
        onUpdateLeaveStatus
    } = props;

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard':
                return <DashboardView appointments={appointments} patients={patients} doctors={doctors} departments={departments} />;
            case 'Doctors':
                return <DoctorsManagement doctors={doctors} setDoctors={setDoctors} />;
            case 'Patients':
                return <PatientsManagement patients={patients} setPatients={setPatients} />;
            case 'Departments':
                return <DepartmentsManagement departments={departments} setDepartments={setDepartments} doctors={doctors} />;
            case 'Appointments':
                return <AppointmentsManagement 
                    appointments={appointments} 
                    setAppointments={setAppointments} 
                    patients={patients} 
                    setPatients={setPatients} 
                    doctors={doctors} 
                    departments={departments} 
                    clinicSettings={clinicSettings}
                    addNotification={addNotification}
                />;
            case 'Leaves':
                return <LeavesManagement leaveRequests={leaveRequests} doctors={doctors} onUpdateStatus={onUpdateLeaveStatus} />;
            case 'Labs':
                return <LabReportsManagement reports={labReports} patients={patients} doctors={doctors} clinicSettings={clinicSettings} />;
            case 'Pharmacy':
                return <PharmacyManagement inventory={inventory} setInventory={setInventory} addNotification={addNotification} />;
            case 'Reports':
                return <Reports 
                    inventory={inventory} 
                    labReports={labReports} 
                    appointments={appointments} 
                    patients={patients}
                    doctors={doctors}
                    departments={departments}
                    prescriptions={prescriptions}
                />;
            case 'Settings':
                return <Settings settings={clinicSettings} setSettings={setClinicSettings} />;
            default:
                return <div className="text-center p-8 bg-white rounded-2xl shadow-sm">Select a section from the sidebar.</div>;
        }
    }

    return (
        <div>
            {renderContent()}
        </div>
    );
};

export default AdminDashboard;