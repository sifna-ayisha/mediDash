import React, { useState } from 'react';
import { Patient } from '../../types';
import { Save, User } from 'lucide-react';

interface PatientProfileProps {
    patient: Patient;
    onUpdatePatient: (patient: Patient) => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onUpdatePatient }) => {
    const [formData, setFormData] = useState<Patient>(patient);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdatePatient(formData);
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (passwordData.newPassword.length < 8) {
             alert("Password must be at least 8 characters long.");
             return;
        }
        onUpdatePatient({ ...formData, password: passwordData.newPassword });
        alert('Password changed successfully!');
        setPasswordData({ newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="font-heading text-2xl font-bold text-gray-800">My Profile</h2>
            <form onSubmit={handleProfileSubmit}>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                    <h3 className="font-heading text-xl font-semibold text-gray-700 mb-6 flex items-center">
                        <User className="mr-3 text-primary" />
                        Personal Information
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" value={formData.name} readOnly className="mt-1 block w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                           <textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-8 mt-6 border-t">
                        <button type="submit" className="flex items-center justify-center px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300">
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
            
             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <h3 className="font-heading text-xl font-semibold text-gray-700 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-secondary text-white rounded-xl hover:bg-cyan-700 transition">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientProfile;
