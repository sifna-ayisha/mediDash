import * as Icons from 'lucide-react';

export enum UserRole {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Lab = 'Lab Technician',
  Pharmacy = 'Pharmacist',
  Owner = 'Owner',
}

export interface NavItem {
  name: string;
  path: string;
  icon: keyof typeof Icons;
}

export interface AvailabilitySlot {
  id: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  password?: string;
  availability?: AvailabilitySlot[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  whatsappNumber?: string;
  address: string;
  admitDate?: string;
  dischargeDate?: string;
  roomNumber?: string;
  paymentStatus?: PaymentStatus;
  password?: string;
}

export interface Department {
  id: string;
  name: string;
  head: string; // Should be a Doctor's ID
  description: string;
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

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  consultationFee: number;
  paymentStatus?: PaymentStatus;
  paymentMode?: PaymentMode;
  whatsappConfirmationSent?: boolean;
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

export interface LabTestParameter {
    name: string;
    observedValue: string;
    referenceValue: string;
}

export interface LabReport {
    id: string;
    reportId: string;
    patientId: string;
    doctorId: string;
    testName: string;
    parameters: LabTestParameter[];
    resultSummary: string;
    reportDate: string;
    status: LabReportStatus;
    sampleId: string;
    sampleStatus: SampleStatus;
    testFee: number;
    paymentStatus: PaymentStatus;
}

export enum StockStatus {
    InStock = 'In Stock',
    LowStock = 'Low Stock',
    OutOfStock = 'Out of Stock',
}

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    supplier: string;
    price: number;
    expiryDate: string;
}

export enum PrescriptionStatus {
    Issued = 'Issued',
    Fulfilled = 'Fulfilled',
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicineName: string;
  dosage: string;
  quantity: number;
  frequency: string;
  instructions?: string;
  dateIssued: string;
  status: PrescriptionStatus;
  dateFulfilled?: string;
  paymentStatus?: PaymentStatus;
  totalAmount?: number;
}

export interface ClinicSettings {
    name: string;
    logo: string | null;
    address: string;
    phone: string;
    email: string;
    gstNumber: string;
    gstRate: number;
}

export enum NotificationType {
    NewAppointment = 'New Appointment',
    LowStock = 'Low Stock',
    Info = 'Info',
    LeaveRequest = 'Leave Request',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
    linkTo: string; // The view to navigate to, e.g., 'Appointments'
}

export enum LeaveStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

export interface LeaveRequest {
    id: string;
    doctorId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
    requestDate: string;
}