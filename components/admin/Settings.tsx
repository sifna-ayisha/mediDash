import React, { useState, useRef } from 'react';
import { ClinicSettings } from '../../types';
import { Building, Upload, Save } from 'lucide-react';

interface SettingsProps {
    settings: ClinicSettings;
    setSettings: React.Dispatch<React.SetStateAction<ClinicSettings>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
    const [formData, setFormData] = useState<ClinicSettings>(settings);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['gstRate'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSettings(formData);
        alert('Settings updated successfully!');
    };
    
    const commonInputClass = "mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <h2 className="font-heading text-2xl font-bold text-slate-800">Clinic Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200">
                    <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6 flex items-center">
                        <Building className="mr-3 text-blue-600" />
                        Branding &amp; Contact Information
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={commonInputClass}
                                required
                            />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Logo</label>
                           <div className="mt-2 flex items-center space-x-6">
                               <div className="shrink-0">
                                   {formData.logo ? (
                                       <img className="h-20 w-auto object-contain rounded-md border p-1 border-slate-200" src={formData.logo} alt="Current Logo" />
                                   ) : (
                                       <div className="h-20 w-20 flex items-center justify-center bg-slate-100 rounded-md text-slate-400">
                                           <span>No Logo</span>
                                       </div>
                                   )}
                               </div>
                               <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                               <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50"
                               >
                                <Upload size={16} className="mr-2" />
                                <span>Change Logo</span>
                               </button>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={commonInputClass}
                                    required
                                />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={commonInputClass}
                                        pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." placeholder="9876543210"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={commonInputClass}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">GST Identification Number (GSTIN)</label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    className={commonInputClass}
                                    placeholder="e.g., 27ABCDE1234F1Z5"
                                    pattern="\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}"
                                    title="Please enter a valid GSTIN (e.g., 27ABCDE1234F1Z5)"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate (%)</label>
                                <input
                                    type="number"
                                    name="gstRate"
                                    value={formData.gstRate}
                                    onChange={handleChange}
                                    className={commonInputClass}
                                    placeholder="e.g., 18"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-8 mt-6 border-t border-slate-200">
                        <button type="submit" className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300">
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Settings;
