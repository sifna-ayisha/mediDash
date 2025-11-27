import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
    DoctorModel, PatientModel, DepartmentModel, AppointmentModel,
    LabReportModel, InventoryItemModel, PrescriptionModel,
    ClinicSettingsModel, NotificationModel, LeaveRequestModel
} from './models';

// We need to import the data from constants.ts. 
// Since constants.ts is in the client folder and uses some client-specific types, 
// we will copy the data here for seeding purposes to avoid complex build dependencies between client and server.

// --- COPIED DATA FROM constants.ts ---
const initialDoctors = [
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

const initialDepartments = [
    { id: 'dep1', name: 'Cardiology', head: 'doc1', description: 'Specializes in heart-related issues.' },
    { id: 'dep2', name: 'Neurology', head: 'doc2', description: 'Focuses on the nervous system.' },
    { id: 'dep3', name: 'Pediatrics', head: 'doc3', description: 'Cares for infants, children, and adolescents.' },
];

const initialPatients = [
    { id: 'pat1', name: 'Alice Williams', age: 34, gender: 'Female', email: 'patient@medidash.com', phone: '9876543213', whatsappNumber: '9876543213', address: '123 Maple St', admitDate: '2024-08-10', dischargeDate: '2024-08-15', roomNumber: '101A', paymentStatus: 'Paid' },
    { id: 'pat2', name: 'Bob Davis', age: 45, gender: 'Male', email: 'bob.d@email.com', phone: '9876543214', whatsappNumber: '9876543214', address: '456 Oak Ave', admitDate: '2024-08-12', dischargeDate: '', roomNumber: '205B', paymentStatus: 'Unpaid' },
    { id: 'pat3', name: 'Charlie Miller', age: 28, gender: 'Male', email: 'charlie.m@email.com', phone: '9876543215', whatsappNumber: '', address: '789 Pine Ln', admitDate: '2024-08-14', dischargeDate: '', roomNumber: '312C', paymentStatus: 'Paid' },
];

const initialAppointments = [
    { id: 'apt1', appointmentNumber: 'APT-2401', patientId: 'pat1', doctorId: 'doc1', departmentId: 'dep1', date: new Date().toISOString().split('T')[0], time: '10:00 AM', reason: 'Annual Checkup', status: 'Scheduled', consultationFee: 500, paymentStatus: 'Paid', paymentMode: 'UPI', whatsappConfirmationSent: false },
    { id: 'apt2', appointmentNumber: 'APT-2402', patientId: 'pat2', doctorId: 'doc2', departmentId: 'dep2', date: new Date().toISOString().split('T')[0], time: '11:30 AM', reason: 'Follow-up', status: 'Scheduled', consultationFee: 750, paymentStatus: 'Unpaid', paymentMode: 'N/A', whatsappConfirmationSent: false },
    { id: 'apt3', appointmentNumber: 'APT-2403', patientId: 'pat3', doctorId: 'doc2', departmentId: 'dep2', date: '2024-08-16', time: '09:00 AM', reason: 'Consultation', status: 'Scheduled', consultationFee: 600, paymentStatus: 'Paid', paymentMode: 'Credit Card', whatsappConfirmationSent: false },
    { id: 'apt4', appointmentNumber: 'APT-2404', patientId: 'pat1', doctorId: 'doc2', departmentId: 'dep2', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '02:00 PM', reason: 'Headache', status: 'Scheduled', consultationFee: 750, paymentStatus: 'Unpaid', paymentMode: 'N/A', whatsappConfirmationSent: false },
];

const initialLabReports = [
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
        status: 'Completed',
        sampleId: 'SMPL-001',
        sampleStatus: 'Under Analysis',
        testFee: 1200,
        paymentStatus: 'Paid',
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
        status: 'Completed',
        sampleId: 'SMPL-002',
        sampleStatus: 'Under Analysis',
        testFee: 850,
        paymentStatus: 'Paid',
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
        status: 'Processing',
        sampleId: 'SMPL-003',
        sampleStatus: 'Received at Lab',
        testFee: 1500,
        paymentStatus: 'Unpaid',
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
        status: 'Pending',
        sampleId: 'SMPL-004',
        sampleStatus: 'Collected',
        testFee: 500,
        paymentStatus: 'Unpaid',
    },
];

const initialInventory = [
    { id: 'M001', name: 'Paracetamol 500mg', stock: 1200, supplier: 'Sun Pharma', price: 2.50, expiryDate: '2025-12-31' },
    { id: 'M002', name: 'Amoxicillin 250mg', stock: 45, supplier: 'Cipla', price: 15.00, expiryDate: '2025-08-01' },
    { id: 'M003', name: 'Ibuprofen 200mg', stock: 850, supplier: 'Dr. Reddy\'s', price: 5.75, expiryDate: '2026-02-28' },
    { id: 'M004', name: 'Lisinopril 10mg', stock: 25, supplier: 'Lupin', price: 8.20, expiryDate: '2024-11-30' },
    { id: 'M005', name: 'Metformin 500mg', stock: 300, supplier: 'Cadila', price: 4.50, expiryDate: '2026-05-10' },
    { id: 'M006', name: 'Aspirin 81mg', stock: 0, supplier: 'Bayer', price: 1.80, expiryDate: '2025-01-15' },
    { id: 'M007', name: 'Atorvastatin 20mg', stock: 150, supplier: 'Pfizer', price: 12.00, expiryDate: '2025-09-20' },
    { id: 'M008', name: 'Cetirizine 10mg', stock: 60, supplier: 'GSK', price: 3.00, expiryDate: '2026-07-01' },
];

const initialPrescriptions = [
    { id: 'presc1', patientId: 'pat2', doctorId: 'doc2', medicineName: 'Lisinopril 10mg', dosage: '10mg', quantity: 30, frequency: 'Once a day', instructions: 'Take one tablet daily with food.', dateIssued: '2024-08-15', status: 'Issued' },
    { id: 'presc2', patientId: 'pat1', doctorId: 'doc1', medicineName: 'Aspirin 81mg', dosage: '81mg', quantity: 60, frequency: 'Once a day', instructions: 'Take one tablet daily in the morning.', dateIssued: '2024-08-16', status: 'Issued' },
    { id: 'presc3', patientId: 'pat3', doctorId: 'doc3', medicineName: 'Metformin 500mg', dosage: '500mg', quantity: 30, frequency: 'Twice a day', instructions: 'Take with meals.', dateIssued: '2024-08-14', status: 'Fulfilled', dateFulfilled: '2024-08-15', totalAmount: 135, paymentStatus: 'Paid' },
    { id: 'presc4', patientId: 'pat1', doctorId: 'doc2', medicineName: 'Paracetamol 500mg', dosage: '500mg', quantity: 20, frequency: 'As needed for pain', instructions: 'Do not exceed 8 tablets in 24 hours.', dateIssued: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'Fulfilled', dateFulfilled: new Date().toISOString().split('T')[0], totalAmount: 50, paymentStatus: 'Unpaid' },
];

const initialClinicSettings = {
    name: 'MediDash',
    logo: null,
    address: '123 Health St, Wellness City, IN 12345',
    phone: '9876543210',
    email: 'contact@medidash.com',
    gstNumber: '27ABCDE1234F1Z5',
    gstRate: 18,
};

const initialNotifications = [
    { id: 'notif1', type: 'Low Stock', message: 'Amoxicillin 250mg is low on stock.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false, linkTo: 'Pharmacy' },
    { id: 'notif2', type: 'New Appointment', message: 'New appointment for Alice Williams.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, linkTo: 'Appointments' },
    { id: 'notif3', type: 'Info', message: 'System maintenance scheduled for tonight.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true, linkTo: 'Dashboard' },
];

const initialLeaveRequests = [
    {
        id: 'leave1',
        doctorId: 'doc1',
        startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        reason: 'Attending a medical conference.',
        status: 'Pending',
        requestDate: new Date().toISOString().split('T')[0],
    },
    {
        id: 'leave2',
        doctorId: 'doc2',
        startDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
        reason: 'Personal leave.',
        status: 'Approved',
        requestDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    }
];

// --- SEED FUNCTION ---

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await DoctorModel.deleteMany({});
        await PatientModel.deleteMany({});
        await DepartmentModel.deleteMany({});
        await AppointmentModel.deleteMany({});
        await LabReportModel.deleteMany({});
        await InventoryItemModel.deleteMany({});
        await PrescriptionModel.deleteMany({});
        await ClinicSettingsModel.deleteMany({});
        await NotificationModel.deleteMany({});
        await LeaveRequestModel.deleteMany({});
        console.log('Cleared existing data.');

        // Insert new data
        await DoctorModel.insertMany(initialDoctors);
        await PatientModel.insertMany(initialPatients);
        await DepartmentModel.insertMany(initialDepartments);
        await AppointmentModel.insertMany(initialAppointments);
        await LabReportModel.insertMany(initialLabReports);
        await InventoryItemModel.insertMany(initialInventory);
        await PrescriptionModel.insertMany(initialPrescriptions);
        await ClinicSettingsModel.create(initialClinicSettings);
        await NotificationModel.insertMany(initialNotifications);
        await LeaveRequestModel.insertMany(initialLeaveRequests);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedData();
