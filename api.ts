const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
    // Doctors
    getDoctors: async () => {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        return response.json();
    },

    createDoctor: async (doctor: any) => {
        const response = await fetch(`${API_BASE_URL}/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor),
        });
        return response.json();
    },

    updateDoctor: async (id: string, doctor: any) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor),
        });
        return response.json();
    },

    // Patients
    getPatients: async () => {
        const response = await fetch(`${API_BASE_URL}/patients`);
        return response.json();
    },

    createPatient: async (patient: any) => {
        const response = await fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        return response.json();
    },

    updatePatient: async (id: string, patient: any) => {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        return response.json();
    },

    // Appointments
    getAppointments: async () => {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        return response.json();
    },

    createAppointment: async (appointment: any) => {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
        });
        return response.json();
    },

    updateAppointment: async (id: string, appointment: any) => {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
        });
        return response.json();
    },

    // Departments
    getDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/departments`);
        return response.json();
    },

    // Lab Reports
    getLabReports: async () => {
        const response = await fetch(`${API_BASE_URL}/lab-reports`);
        return response.json();
    },

    createLabReport: async (report: any) => {
        const response = await fetch(`${API_BASE_URL}/lab-reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        });
        return response.json();
    },

    updateLabReport: async (id: string, report: any) => {
        const response = await fetch(`${API_BASE_URL}/lab-reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        });
        return response.json();
    },

    // Inventory
    getInventory: async () => {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        return response.json();
    },

    updateInventoryItem: async (id: string, item: any) => {
        const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        return response.json();
    },

    // Prescriptions
    getPrescriptions: async () => {
        const response = await fetch(`${API_BASE_URL}/prescriptions`);
        return response.json();
    },

    createPrescription: async (prescription: any) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prescription),
        });
        return response.json();
    },

    updatePrescription: async (id: string, prescription: any) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prescription),
        });
        return response.json();
    },

    // Settings
    getSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/settings`);
        return response.json();
    },

    updateSettings: async (settings: any) => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        return response.json();
    },

    // Notifications
    getNotifications: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications`);
        return response.json();
    },

    createNotification: async (notification: any) => {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification),
        });
        return response.json();
    },

    // Leave Requests
    getLeaveRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves`);
        return response.json();
    },

    createLeaveRequest: async (request: any) => {
        const response = await fetch(`${API_BASE_URL}/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        return response.json();
    },

    updateLeaveRequest: async (id: string, request: any) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        return response.json();
    },
};
