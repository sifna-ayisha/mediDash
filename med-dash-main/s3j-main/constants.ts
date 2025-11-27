import { Doctor, Patient, Department, Appointment, NavItem, AppointmentStatus, LabReport, LabReportStatus, InventoryItem, ClinicSettings, Notification, NotificationType, Prescription, PrescriptionStatus, SampleStatus, PaymentStatus, AvailabilitySlot, PaymentMode, LeaveRequest, LeaveStatus } from './types';

export const adminNav: NavItem[] = [
  { name: 'Dashboard', path: '#', icon: 'LayoutDashboard' },
  { name: 'Doctors', path: '#', icon: 'Stethoscope' },
  { name: 'Departments', path: '#', icon: 'Building' },
  { name: 'Patients', path: '#', icon: 'Users' },
  { name: 'Appointments', path: '#', icon: 'CalendarDays' },
  { name: 'Leaves', path: '#', icon: 'CalendarOff' },
  { name: 'Labs', path: '#', icon: 'Beaker' },
  { name: 'Pharmacy', path: '#', icon: 'Pill' },
  { name: 'Reports', path: '#', icon: 'FileText' },
  { name: 'Settings', path: '#', icon: 'Settings' },
];

export const ownerNav: NavItem[] = [
  { name: 'Dashboard', path: '#', icon: 'IndianRupee' },
];

export const doctorNav: NavItem[] = [
  { name: 'Dashboard', path: '#', icon: 'LayoutDashboard' },
  { name: 'Schedule', path: '#', icon: 'CalendarDays' },
  { name: 'Leaves', path: '#', icon: 'CalendarOff' },
  { name: 'Availability', path: '#', icon: 'Clock' },
  { name: 'Patients', path: '#', icon: 'Users' },
  { name: 'Prescriptions', path: '#', icon: 'FilePlus' },
  { name: 'Lab Reports', path: '#', icon: 'TestTube2' },
  { name: 'Messages', path: '#', icon: 'MessageSquare' },
  { name: 'Settings', path: '#', icon: 'Settings' },
];

export const labNav: NavItem[] = [
  { name: 'Dashboard', path: '#', icon: 'LayoutDashboard' },
  { name: 'Test Requests', path: '#', icon: 'ClipboardList' },
  { name: 'Sample Tracking', path: '#', icon: 'TestTube2' },
  { name: 'Reports', path: '#', icon: 'FileText' },
  { name: 'Lab Billing', path: '#', icon: 'IndianRupee' },
];

export const pharmacyNav: NavItem[] = [
  { name: 'Dashboard', path: '#', icon: 'LayoutDashboard' },
  { name: 'Prescriptions', path: '#', icon: 'FilePlus' },
  { name: 'Inventory', path: '#', icon: 'Boxes' },
  { name: 'Sales', path: '#', icon: 'IndianRupee' },
  { name: 'Billing', path: '#', icon: 'Receipt' },
  { name: 'Reorder', path: '#', icon: 'Repeat' },
];

// MOCK DATA
export const initialDoctors: Doctor[] = [
  { 
    id: 'doc1', 
    name: 'Dr. John Smith', 
    specialty: 'Cardiology', 
    email: 'john.smith@medidash.com', 
    phone: '9876543210', 
    password: 'password123',
    availability: [
      { id: 'avail1', day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { id: 'avail2', day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
      { id: 'avail3', day: 'Friday', startTime: '09:00', endTime: '17:00' },
    ]
  },
  { 
    id: 'doc2', 
    name: 'Dr. Emily Johnson', 
    specialty: 'Neurology', 
    email: 'doctor@medidash.com', 
    phone: '9876543211', 
    password: 'password123',
    availability: [
      { id: 'avail4', day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { id: 'avail5', day: 'Thursday', startTime: '10:00', endTime: '18:00' },
    ]
  },
  { 
    id: 'doc3', 
    name: 'Dr. Michael Brown', 
    specialty: 'Pediatrics', 
    email: 'michael.b@medidash.com', 
    phone: '9876543212', 
    password: 'password123',
    availability: [
      { id: 'avail6', day: 'Monday', startTime: '08:00', endTime: '12:00' },
      { id: 'avail7', day: 'Tuesday', startTime: '13:00', endTime: '17:00' },
      { id: 'avail8', day: 'Thursday', startTime: '08:00', endTime: '12:00' },
    ]
  },
];

export const initialDepartments: Department[] = [
    { id: 'dep1', name: 'Cardiology', head: 'doc1', description: 'Specializes in heart-related issues.' },
    { id: 'dep2', name: 'Neurology', head: 'doc2', description: 'Focuses on the nervous system.' },
    { id: 'dep3', name: 'Pediatrics', head: 'doc3', description: 'Cares for infants, children, and adolescents.' },
];

export const initialPatients: Patient[] = [
  { id: 'pat1', name: 'Alice Williams', age: 34, gender: 'Female', email: 'patient@medidash.com', phone: '9876543213', whatsappNumber: '9876543213', address: '123 Maple St', admitDate: '2024-08-10', dischargeDate: '2024-08-15', roomNumber: '101A', paymentStatus: PaymentStatus.Paid },
  { id: 'pat2', name: 'Bob Davis', age: 45, gender: 'Male', email: 'bob.d@email.com', phone: '9876543214', whatsappNumber: '9876543214', address: '456 Oak Ave', admitDate: '2024-08-12', dischargeDate: '', roomNumber: '205B', paymentStatus: PaymentStatus.Unpaid },
  { id: 'pat3', name: 'Charlie Miller', age: 28, gender: 'Male', email: 'charlie.m@email.com', phone: '9876543215', whatsappNumber: '', address: '789 Pine Ln', admitDate: '2024-08-14', dischargeDate: '', roomNumber: '312C', paymentStatus: PaymentStatus.Paid },
];

export const initialAppointments: Appointment[] = [
  { id: 'apt1', appointmentNumber: 'APT-2401', patientId: 'pat1', doctorId: 'doc1', departmentId: 'dep1', date: new Date().toISOString().split('T')[0], time: '10:00 AM', reason: 'Annual Checkup', status: AppointmentStatus.Scheduled, consultationFee: 500, paymentStatus: PaymentStatus.Paid, paymentMode: PaymentMode.UPI, whatsappConfirmationSent: false },
  { id: 'apt2', appointmentNumber: 'APT-2402', patientId: 'pat2', doctorId: 'doc2', departmentId: 'dep2', date: new Date().toISOString().split('T')[0], time: '11:30 AM', reason: 'Follow-up', status: AppointmentStatus.Scheduled, consultationFee: 750, paymentStatus: PaymentStatus.Unpaid, paymentMode: PaymentMode.NotApplicable, whatsappConfirmationSent: false },
  { id: 'apt3', appointmentNumber: 'APT-2403', patientId: 'pat3', doctorId: 'doc2', departmentId: 'dep2', date: '2024-08-16', time: '09:00 AM', reason: 'Consultation', status: AppointmentStatus.Scheduled, consultationFee: 600, paymentStatus: PaymentStatus.Paid, paymentMode: PaymentMode.CreditCard, whatsappConfirmationSent: false },
  { id: 'apt4', appointmentNumber: 'APT-2404', patientId: 'pat1', doctorId: 'doc2', departmentId: 'dep2', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '02:00 PM', reason: 'Headache', status: AppointmentStatus.Scheduled, consultationFee: 750, paymentStatus: PaymentStatus.Unpaid, paymentMode: PaymentMode.NotApplicable, whatsappConfirmationSent: false },
];

export const initialLabReports: LabReport[] = [
    { 
        id: 'lab1', 
        reportId: 'LAB-RPT-001', 
        patientId: 'pat1', 
        doctorId: 'doc1', 
        testName: 'Complete Blood Count (CBC)', 
        parameters: [
            { name: 'Hemoglobin', observedValue: '14.5 g/dL', referenceValue: '13.5-17.5 g/dL' },
            { name: 'WBC Count', observedValue: '7,500 /mcL', referenceValue: '4,500-11,000 /mcL' },
            { name: 'Platelets', observedValue: '250,000 /mcL', referenceValue: '150,000-450,000 /mcL' },
        ],
        resultSummary: 'All values within normal range.', 
        reportDate: '2024-08-16', 
        status: LabReportStatus.Completed, 
        sampleId: 'SMPL-001', 
        sampleStatus: SampleStatus.Analyzing,
        testFee: 1200,
        paymentStatus: PaymentStatus.Paid,
    },
    { 
        id: 'lab2', 
        reportId: 'LAB-RPT-002', 
        patientId: 'pat2', 
        doctorId: 'doc2', 
        testName: 'Lipid Panel', 
        parameters: [
            { name: 'Total Cholesterol', observedValue: '210 mg/dL', referenceValue: '< 200 mg/dL' },
            { name: 'LDL Cholesterol', observedValue: '140 mg/dL', referenceValue: '< 100 mg/dL' },
            { name: 'HDL Cholesterol', observedValue: '50 mg/dL', referenceValue: '> 40 mg/dL' },
        ],
        resultSummary: 'Slightly elevated LDL cholesterol.', 
        reportDate: '2024-08-17', 
        status: LabReportStatus.Completed, 
        sampleId: 'SMPL-002', 
        sampleStatus: SampleStatus.Analyzing,
        testFee: 850,
        paymentStatus: PaymentStatus.Paid,
    },
    { 
        id: 'lab3', 
        reportId: 'LAB-RPT-003', 
        patientId: 'pat3', 
        doctorId: 'doc3', 
        testName: 'Thyroid Function Test', 
        parameters: [],
        resultSummary: 'Awaiting final analysis.', 
        reportDate: '2024-08-18', 
        status: LabReportStatus.Processing, 
        sampleId: 'SMPL-003', 
        sampleStatus: SampleStatus.Received,
        testFee: 1500,
        paymentStatus: PaymentStatus.Unpaid,
    },
    { 
        id: 'lab4', 
        reportId: 'LAB-RPT-004', 
        patientId: 'pat1', 
        doctorId: 'doc1', 
        testName: 'Urinalysis', 
        parameters: [],
        resultSummary: 'Pending sample collection.', 
        reportDate: '2024-08-19', 
        status: LabReportStatus.Pending, 
        sampleId: 'SMPL-004', 
        sampleStatus: SampleStatus.Collected,
        testFee: 500,
        paymentStatus: PaymentStatus.Unpaid,
    },
];

export const initialInventory: InventoryItem[] = [
  { id: 'M001', name: 'Paracetamol 500mg', stock: 1200, supplier: 'Sun Pharma', price: 2.50, expiryDate: '2025-12-31' },
  { id: 'M002', name: 'Amoxicillin 250mg', stock: 45, supplier: 'Cipla', price: 15.00, expiryDate: '2025-08-01' },
  { id: 'M003', name: 'Ibuprofen 200mg', stock: 850, supplier: 'Dr. Reddy\'s', price: 5.75, expiryDate: '2026-02-28' },
  { id: 'M004', name: 'Lisinopril 10mg', stock: 25, supplier: 'Lupin', price: 8.20, expiryDate: '2024-11-30' },
  { id: 'M005', name: 'Metformin 500mg', stock: 300, supplier: 'Cadila', price: 4.50, expiryDate: '2026-05-10' },
  { id: 'M006', name: 'Aspirin 81mg', stock: 0, supplier: 'Bayer', price: 1.80, expiryDate: '2025-01-15' },
  { id: 'M007', name: 'Atorvastatin 20mg', stock: 150, supplier: 'Pfizer', price: 12.00, expiryDate: '2025-09-20' },
  { id: 'M008', name: 'Cetirizine 10mg', stock: 60, supplier: 'GSK', price: 3.00, expiryDate: '2026-07-01' },
];

export const initialPrescriptions: Prescription[] = [
    { id: 'presc1', patientId: 'pat2', doctorId: 'doc2', medicineName: 'Lisinopril 10mg', dosage: '10mg', quantity: 30, frequency: 'Once a day', instructions: 'Take one tablet daily with food.', dateIssued: '2024-08-15', status: PrescriptionStatus.Issued },
    { id: 'presc2', patientId: 'pat1', doctorId: 'doc1', medicineName: 'Aspirin 81mg', dosage: '81mg', quantity: 60, frequency: 'Once a day', instructions: 'Take one tablet daily in the morning.', dateIssued: '2024-08-16', status: PrescriptionStatus.Issued },
    { id: 'presc3', patientId: 'pat3', doctorId: 'doc3', medicineName: 'Metformin 500mg', dosage: '500mg', quantity: 30, frequency: 'Twice a day', instructions: 'Take with meals.', dateIssued: '2024-08-14', status: PrescriptionStatus.Fulfilled, dateFulfilled: '2024-08-15', totalAmount: 135, paymentStatus: PaymentStatus.Paid },
    { id: 'presc4', patientId: 'pat1', doctorId: 'doc2', medicineName: 'Paracetamol 500mg', dosage: '500mg', quantity: 20, frequency: 'As needed for pain', instructions: 'Do not exceed 8 tablets in 24 hours.', dateIssued: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: PrescriptionStatus.Fulfilled, dateFulfilled: new Date().toISOString().split('T')[0], totalAmount: 50, paymentStatus: PaymentStatus.Unpaid },
];

export const incomeReportsData = [
  { month: 'Jan', pharmacy: 12000, lab: 8000, booking: 5000 },
  { month: 'Feb', pharmacy: 15000, lab: 9500, booking: 6200 },
  { month: 'Mar', pharmacy: 18000, lab: 11000, booking: 7100 },
  { month: 'Apr', pharmacy: 16000, lab: 10500, booking: 6800 },
  { month: 'May', pharmacy: 22000, lab: 13000, booking: 8500 },
  { month: 'Jun', pharmacy: 25000, lab: 15000, booking: 9200 },
];

export const initialClinicSettings: ClinicSettings = {
    name: 'MediDash',
    logo: null,
    address: '123 Health St, Wellness City, IN 12345',
    phone: '9876543210',
    email: 'contact@medidash.com',
    gstNumber: '27ABCDE1234F1Z5',
    gstRate: 18,
};

export const initialNotifications: Notification[] = [
  { id: 'notif1', type: NotificationType.LowStock, message: 'Amoxicillin 250mg is low on stock.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false, linkTo: 'Pharmacy' },
  { id: 'notif2', type: NotificationType.NewAppointment, message: 'New appointment for Alice Williams.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, linkTo: 'Appointments' },
  { id: 'notif3', type: NotificationType.Info, message: 'System maintenance scheduled for tonight.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true, linkTo: 'Dashboard' },
];

export const initialLeaveRequests: LeaveRequest[] = [
    {
        id: 'leave1',
        doctorId: 'doc1',
        startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        reason: 'Attending a medical conference.',
        status: LeaveStatus.Pending,
        requestDate: new Date().toISOString().split('T')[0],
    },
     {
        id: 'leave2',
        doctorId: 'doc2',
        startDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
        reason: 'Personal leave.',
        status: LeaveStatus.Approved,
        requestDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    }
];

export const TOTAL_BEDS = 150;