import React, { useState } from 'react';
import { Doctor } from '../../types';

interface ProfileSettingsProps {
    doctor: Doctor;
    onUpdateDoctor: (doctor: Doctor) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ doctor, onUpdateDoctor }) => {
    const [profileData, setProfileData] = useState<Doctor>(doctor);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateDoctor(profileData);
        alert('Profile updated successfully!');
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
        onUpdateDoctor({ ...profileData, password: passwordData.newPassword });
        alert('Password changed successfully!');
        setPasswordData({ newPassword: '', confirmPassword: '' });
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6">Profile Information</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className={commonInputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Specialty</label>
                            <input type="text" name="specialty" value={profileData.specialty} onChange={handleProfileChange} className={commonInputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className={commonInputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                            <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className={commonInputClass} pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210" required />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Save Changes</button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={commonInputClass} placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={commonInputClass} placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
