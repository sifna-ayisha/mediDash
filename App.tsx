"use client";

import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import LabDashboard from './components/dashboards/LabDashboard';
import PharmacyDashboard from './components/dashboards/PharmacyDashboard';
import OwnerDashboard from './components/dashboards/OwnerDashboard';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import { UserRole, Doctor, Patient, Department, Appointment, LabReport, InventoryItem, ClinicSettings, Notification, Prescription, NotificationType, LeaveRequest, LeaveStatus } from './types';
import { ownerNav, adminNav, doctorNav, labNav, pharmacyNav } from './constants';
import { api } from './api';

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole | null; email?: string }>({ role: null });
  const [activeView, setActiveView] = useState('Dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Centralized state management
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          doctorsData,
          patientsData,
          departmentsData,
          appointmentsData,
          labReportsData,
          inventoryData,
          prescriptionsData,
          settingsData,
          notificationsData,
          leavesData
        ] = await Promise.all([
          api.getDoctors(),
          api.getPatients(),
          api.getDepartments(),
          api.getAppointments(),
          api.getLabReports(),
          api.getInventory(),
          api.getPrescriptions(),
          api.getSettings(),
          api.getNotifications(),
          api.getLeaveRequests()
        ]);

        setDoctors(doctorsData);
        setPatients(patientsData);
        setDepartments(departmentsData);
        setAppointments(appointmentsData);
        setLabReports(labReportsData);
        setInventory(inventoryData);
        setPrescriptions(prescriptionsData);
        setClinicSettings(settingsData);
        setNotifications(notificationsData);
        setLeaveRequests(leavesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);


  const handleLogin = useCallback((role: UserRole, email: string) => {
    setUser({ role, email });
    setActiveView('Dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setUser({ role: null });
    setActiveView('Dashboard');
  }, []);

  // Close mobile sidebar when view changes
  useEffect(() => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [activeView]);

  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    setDoctors(prevDoctors => prevDoctors.map(d => d.id === updatedDoctor.id ? updatedDoctor : d));
  };

  const addNotification = (type: NotificationType, message: string, linkTo: string) => {
    const newNotification: Notification = {
      id: `notif${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      linkTo,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleApplyLeave = (request: LeaveRequest) => {
    setLeaveRequests(prev => [request, ...prev]);
    const doctorName = doctors.find(d => d.id === request.doctorId)?.name || 'A doctor';
    addNotification(NotificationType.LeaveRequest, `New leave request from ${doctorName}.`, 'Leaves');
  };

  const handleUpdateLeaveStatus = (id: string, status: LeaveStatus) => {
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    const request = leaveRequests.find(req => req.id === id);
    // Ideally, we should target notification to the specific doctor, but for now we add to general list which everyone sees in this simple app
    if (request) {
      addNotification(NotificationType.Info, `Leave request for ${request.startDate} has been ${status.toLowerCase()}.`, 'Leaves');
    }
  };

  const renderDashboard = () => {
    if (!user.role) return null;

    const navItems = {
      [UserRole.Owner]: ownerNav,
      [UserRole.Admin]: adminNav,
      [UserRole.Doctor]: doctorNav,
      [UserRole.Lab]: labNav,
      [UserRole.Pharmacy]: pharmacyNav,
    }[user.role];

    // Find the logged-in user. In a real app, this would be based on a secure ID.
    const loggedInDoctor = doctors.find(doc => doc.email === user.email);

    const DashboardComponent = {
      [UserRole.Owner]: (
        <OwnerDashboard
          labReports={labReports}
          prescriptions={prescriptions}
          appointments={appointments}
          departments={departments}
          doctors={doctors}
          patients={patients}
          leaveRequests={leaveRequests}
        />
      ),
      [UserRole.Admin]: (
        <AdminDashboard
          activeView={activeView}
          doctors={doctors}
          setDoctors={setDoctors}
          patients={patients}
          setPatients={setPatients}
          departments={departments}
          setDepartments={setDepartments}
          appointments={appointments}
          setAppointments={setAppointments}
          labReports={labReports}
          inventory={inventory}
          setInventory={setInventory}
          clinicSettings={clinicSettings || { name: 'MediDash', logo: null, address: '', phone: '', email: '', gstNumber: '', gstRate: 0 }}
          setClinicSettings={setClinicSettings}
          addNotification={addNotification}
          prescriptions={prescriptions}
          leaveRequests={leaveRequests}
          onUpdateLeaveStatus={handleUpdateLeaveStatus}
        />
      ),
      [UserRole.Doctor]: (
        <DoctorDashboard
          activeView={activeView}
          doctor={loggedInDoctor}
          onUpdateDoctor={handleUpdateDoctor}
          appointments={appointments}
          patients={patients}
          inventory={inventory}
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          clinicSettings={clinicSettings || { name: 'MediDash', logo: null, address: '', phone: '', email: '', gstNumber: '', gstRate: 0 }}
          labReports={labReports}
          setLabReports={setLabReports}
          doctors={doctors}
          leaveRequests={leaveRequests}
          onApplyLeave={handleApplyLeave}
        />
      ),
      [UserRole.Lab]: <LabDashboard
        activeView={activeView}
        labReports={labReports}
        setLabReports={setLabReports}
        patients={patients}
        doctors={doctors}
        clinicSettings={clinicSettings || { name: 'MediDash', logo: null, address: '', phone: '', email: '', gstNumber: '', gstRate: 0 }}
      />,
      [UserRole.Pharmacy]: (
        <PharmacyDashboard
          activeView={activeView}
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          inventory={inventory}
          setInventory={setInventory}
          patients={patients}
          doctors={doctors}
          addNotification={addNotification}
          clinicSettings={clinicSettings || { name: 'MediDash', logo: null, address: '', phone: '', email: '', gstNumber: '', gstRate: 0 }}
        />
      ),
    }[user.role];

    return (
      <div className="flex h-screen bg-slate-100 font-sans">
        {/* Backdrop for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
        )}

        <Sidebar
          navItems={navItems}
          activeView={activeView}
          onNavigate={setActiveView}
          clinicSettings={clinicSettings}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            userRole={user.role}
            onLogout={handleLogout}
            notifications={notifications}
            setNotifications={setNotifications}
            onNavigate={setActiveView}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
            {DashboardComponent}
          </main>
        </div>
      </div>
    );
  };

  return (
    <div className="antialiased text-slate-800">
      {user.role ? renderDashboard() : <LoginPage onLogin={handleLogin} />}
    </div>
  );
};

export default App;