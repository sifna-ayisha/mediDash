import express from 'express';
import {
    DoctorModel, PatientModel, DepartmentModel, AppointmentModel,
    LabReportModel, InventoryItemModel, PrescriptionModel,
    ClinicSettingsModel, NotificationModel, LeaveRequestModel
} from './models';

const router = express.Router();

// --- Doctors ---
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await DoctorModel.find();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/doctors', async (req, res) => {
    try {
        const newDoctor = new DoctorModel(req.body);
        await newDoctor.save();
        res.status(201).json(newDoctor);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

router.put('/doctors/:id', async (req, res) => {
    try {
        const updatedDoctor = await DoctorModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedDoctor);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Patients ---
router.get('/patients', async (req, res) => {
    try {
        const patients = await PatientModel.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/patients', async (req, res) => {
    try {
        const newPatient = new PatientModel(req.body);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

router.put('/patients/:id', async (req, res) => {
    try {
        const updatedPatient = await PatientModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Appointments ---
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await AppointmentModel.find();
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/appointments', async (req, res) => {
    try {
        const newAppointment = new AppointmentModel(req.body);
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

router.put('/appointments/:id', async (req, res) => {
    try {
        const updatedAppointment = await AppointmentModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Departments ---
router.get('/departments', async (req, res) => {
    try {
        const departments = await DepartmentModel.find();
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

// --- Lab Reports ---
router.get('/lab-reports', async (req, res) => {
    try {
        const reports = await LabReportModel.find();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/lab-reports', async (req, res) => {
    try {
        const newReport = new LabReportModel(req.body);
        await newReport.save();
        res.status(201).json(newReport);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

router.put('/lab-reports/:id', async (req, res) => {
    try {
        const updatedReport = await LabReportModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Inventory ---
router.get('/inventory', async (req, res) => {
    try {
        const items = await InventoryItemModel.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.put('/inventory/:id', async (req, res) => {
    try {
        const updatedItem = await InventoryItemModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Prescriptions ---
router.get('/prescriptions', async (req, res) => {
    try {
        const prescriptions = await PrescriptionModel.find();
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/prescriptions', async (req, res) => {
    try {
        const newPrescription = new PrescriptionModel(req.body);
        await newPrescription.save();
        res.status(201).json(newPrescription);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

router.put('/prescriptions/:id', async (req, res) => {
    try {
        const updatedPrescription = await PrescriptionModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedPrescription);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Settings ---
router.get('/settings', async (req, res) => {
    try {
        const settings = await ClinicSettingsModel.findOne();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.put('/settings', async (req, res) => {
    try {
        // Upsert settings (update if exists, insert if not)
        const updatedSettings = await ClinicSettingsModel.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(updatedSettings);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Notifications ---
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await NotificationModel.find().sort({ timestamp: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        const newNotification = new NotificationModel(req.body);
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

// --- Leaves ---
router.get('/leaves', async (req, res) => {
    try {
        const leaves = await LeaveRequestModel.find().sort({ requestDate: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.post('/leaves', async (req, res) => {
    try {
        const newLeave = new LeaveRequestModel(req.body);
        await newLeave.save();
        res.status(201).json(newLeave);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

router.put('/leaves/:id', async (req, res) => {
    try {
        const updatedLeave = await LeaveRequestModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedLeave);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

export default router;
