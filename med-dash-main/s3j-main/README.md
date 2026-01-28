# mediDash - Frontend

Frontend application for the Hospital Management System built with React, Next.js, and Vite.

## Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── LoginPage.tsx              # Authentication
│   ├── admin/                     # Admin features
│   │   ├── AppointmentsManagement.tsx
│   │   ├── DepartmentsManagement.tsx
│   │   ├── DoctorsManagement.tsx
│   │   ├── LabReportsManagement.tsx
│   │   ├── LeavesManagement.tsx
│   │   ├── PatientsManagement.tsx
│   │   ├── PharmacyManagement.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── doctor/                    # Doctor features
│   │   ├── DoctorAvailability.tsx
│   │   ├── DoctorLabReports.tsx
│   │   ├── DoctorLeaves.tsx
│   │   ├── DoctorPatients.tsx
│   │   ├── DoctorPrescriptions.tsx
│   │   ├── DoctorSchedule.tsx
│   │   └── PrescriptionPDF.tsx
│   ├── patient/                   # Patient features
│   │   ├── PatientAppointments.tsx
│   │   ├── PatientLabReports.tsx
│   │   ├── PatientPrescriptions.tsx
│   │   └── PatientProfile.tsx
│   ├── pharmacy/                  # Pharmacy management
│   │   ├── PharmacyBilling.tsx
│   │   ├── PharmacyInventory.tsx
│   │   ├── PharmacyInvoice.tsx
│   │   ├── PharmacyPrescriptions.tsx
│   │   ├── PharmacyReorder.tsx
│   │   └── PharmacySales.tsx
│   ├── lab/                       # Lab management
│   │   ├── LabBilling.tsx
│   │   ├── LabFinalReports.tsx
│   │   ├── LabReportForm.tsx
│   │   └── SampleTracking.tsx
│   ├── owner/                     # Owner analytics
│   │   └── DoctorPerformance.tsx
│   ├── dashboards/                # Role-based dashboards
│   │   ├── AdminDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── LabDashboard.tsx
│   │   ├── OwnerDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   └── PharmacyDashboard.tsx
│   └── common/                    # Shared components
│       ├── Card.tsx
│       ├── Header.tsx
│       ├── Modal.tsx
│       └── Sidebar.tsx
├── app/
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── api.ts                         # API client
├── App.tsx                        # Root component
├── constants.ts                   # Application constants
├── types.ts                       # TypeScript type definitions
├── index.html                     # HTML entry point
├── index.tsx                      # React entry point
└── vite.config.ts                 # Vite configuration
```

## Key Features

### Role-Based Access
- **Patient Dashboard**: View appointments, lab reports, prescriptions, and personal profile
- **Doctor Dashboard**: Manage patients, schedule, prescriptions, lab reports, and leaves
- **Lab Dashboard**: Manage lab tests, sample tracking, final reports, and billing
- **Pharmacy Dashboard**: Manage inventory, prescriptions, sales, reorders, invoicing, and billing
- **Admin Dashboard**: Manage users, departments, appointments, leaves, and generate reports
- **Owner Dashboard**: View performance analytics and system reports

### Core Functionality
- Appointment scheduling and management
- Lab test ordering and report generation
- Prescription management and PDF generation
- Inventory management
- Billing and invoice generation
- Leave management
- User management
- Department management

## Technologies Used

- **React 19.2.0** - UI library
- **Next.js 16.0.3** - React framework
- **Vite 6.2.0** - Build tool and dev server
- **TypeScript 5.8.2** - Type safety
- **Recharts 3.4.1** - Data visualization
- **jsPDF 2.5.1** & **html2canvas 1.4.1** - PDF generation
- **XLSX** - Excel export functionality
- **Lucide React** - Icon library

## API Integration

The frontend communicates with the backend API. Update the API endpoint in [api.ts](api.ts) based on your backend configuration.

Default backend URL: `http://localhost:5000`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Development Notes

- Hot module replacement (HMR) is enabled for fast development
- TypeScript strict mode is enabled for type safety
- Vite provides fast development server startup

## Need Help?

Refer to the main [README.md](../README.md) for project overview and setup instructions.
