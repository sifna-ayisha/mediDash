import mongoose, { Schema, Document } from 'mongoose';

// Enums
export enum UserRole {
    Admin = 'Admin',
    Doctor = 'Doctor',
    Lab = 'Lab Technician',
    Pharmacy = 'Pharmacist',
    Owner = 'Owner',
}

export enum AppointmentStatus {
    Scheduled = 'Scheduled',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
}

export enum PaymentMode {
    Cash = 'Cash',
    UPI = 'UPI',
    DebitCard = 'Debit Card',
    CreditCard = 'Credit Card',
    NetBanking = 'Net Banking',
    NotApplicable = 'N/A',
}

export enum LabReportStatus {
    Pending = 'Pending',
    Processing = 'Processing',
    Completed = 'Completed',
}

export enum SampleStatus {
    Collected = 'Collected',
    InTransit = 'In-Transit',
    Received = 'Received at Lab',
    Analyzing = 'Under Analysis',
}

export enum PaymentStatus {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
}

export enum PrescriptionStatus {
    Issued = 'Issued',
    Fulfilled = 'Fulfilled',
}

export enum NotificationType {
    NewAppointment = 'New Appointment',
    LowStock = 'Low Stock',
    Info = 'Info',
    LeaveRequest = 'Leave Request',
}

export enum LeaveStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

// Schemas

const DoctorSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    availability: [{
        id: String,
        day: String,
        startTime: String,
        endTime: String
    }]
});

const PatientSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    whatsappNumber: String,
    address: { type: String, required: true },
    admitDate: String,
    dischargeDate: String,
    roomNumber: String,
    paymentStatus: { type: String, enum: Object.values(PaymentStatus) },
    password: String
});

const DepartmentSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    head: { type: String, required: true }, // Doctor ID
    description: { type: String, required: true }
});

const AppointmentSchema = new Schema({
    id: { type: String, required: true, unique: true },
    appointmentNumber: { type: String, required: true },
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    departmentId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.Scheduled },
    consultationFee: { type: Number, required: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus) },
    paymentMode: { type: String, enum: Object.values(PaymentMode) },
    whatsappConfirmationSent: Boolean
});

const LabReportSchema = new Schema({
    id: { type: String, required: true, unique: true },
    reportId: { type: String, required: true },
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    testName: { type: String, required: true },
    parameters: [{
        name: String,
        observedValue: String,
        referenceValue: String
    }],
    resultSummary: String,
    reportDate: String,
    status: { type: String, enum: Object.values(LabReportStatus) },
    sampleId: String,
    sampleStatus: { type: String, enum: Object.values(SampleStatus) },
    testFee: Number,
    paymentStatus: { type: String, enum: Object.values(PaymentStatus) }
});

const InventoryItemSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    supplier: { type: String, required: true },
    price: { type: Number, required: true },
    expiryDate: { type: String, required: true }
});

const PrescriptionSchema = new Schema({
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    quantity: { type: Number, required: true },
    frequency: { type: String, required: true },
    instructions: String,
    dateIssued: { type: String, required: true },
    status: { type: String, enum: Object.values(PrescriptionStatus) },
    dateFulfilled: String,
    paymentStatus: { type: String, enum: Object.values(PaymentStatus) },
    totalAmount: Number
});

const ClinicSettingsSchema = new Schema({
    name: String,
    logo: String,
    address: String,
    phone: String,
    email: String,
    gstNumber: String,
    gstRate: Number
});

const NotificationSchema = new Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(NotificationType) },
    message: String,
    timestamp: String,
    read: Boolean,
    linkTo: String
});

const LeaveRequestSchema = new Schema({
    id: { type: String, required: true, unique: true },
    doctorId: { type: String, required: true },
    startDate: String,
    endDate: String,
    reason: String,
    status: { type: String, enum: Object.values(LeaveStatus) },
    requestDate: String
});

export const DoctorModel = mongoose.model('Doctor', DoctorSchema);
export const PatientModel = mongoose.model('Patient', PatientSchema);
export const DepartmentModel = mongoose.model('Department', DepartmentSchema);
export const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
export const LabReportModel = mongoose.model('LabReport', LabReportSchema);
export const InventoryItemModel = mongoose.model('InventoryItem', InventoryItemSchema);
export const PrescriptionModel = mongoose.model('Prescription', PrescriptionSchema);
export const ClinicSettingsModel = mongoose.model('ClinicSettings', ClinicSettingsSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);
export const LeaveRequestModel = mongoose.model('LeaveRequest', LeaveRequestSchema);
