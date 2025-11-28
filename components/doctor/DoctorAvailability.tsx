import React, { useState, useMemo } from 'react';
import { Doctor, AvailabilitySlot } from '../../types';
import { Plus, Trash2, Clock, Edit, Check, X } from 'lucide-react';

interface DoctorAvailabilityProps {
    doctor: Doctor;
    onUpdateDoctor: (doctor: Doctor) => void;
}

const daysOfWeek: AvailabilitySlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({ doctor, onUpdateDoctor }) => {
    const [newSlot, setNewSlot] = useState<Omit<AvailabilitySlot, 'id'>>({
        day: 'Monday',
        startTime: '',
        endTime: '',
    });
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
    const [editedSlotData, setEditedSlotData] = useState<Pick<AvailabilitySlot, 'startTime' | 'endTime'> | null>(null);


    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSlot(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSlot = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlot.startTime || !newSlot.endTime) {
            alert('Please select start and end times.');
            return;
        }
        if (newSlot.startTime >= newSlot.endTime) {
            alert('Start time must be before end time.');
            return;
        }

        const newAvailability: AvailabilitySlot[] = [
            ...(doctor.availability || []),
            { ...newSlot, id: `avail${Date.now()}` }
        ];

        onUpdateDoctor({ ...doctor, availability: newAvailability });
        setNewSlot({ day: 'Monday', startTime: '', endTime: '' });
    };

    const handleDeleteSlot = (slotId: string) => {
        const updatedAvailability = doctor.availability?.filter(slot => slot.id !== slotId);
        onUpdateDoctor({ ...doctor, availability: updatedAvailability });
    };
    
    const handleEditClick = (slot: AvailabilitySlot) => {
        setEditingSlotId(slot.id);
        setEditedSlotData({ startTime: slot.startTime, endTime: slot.endTime });
    };
    
    const handleEditCancel = () => {
        setEditingSlotId(null);
        setEditedSlotData(null);
    };
    
    const handleEditDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedSlotData(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    const handleUpdateSlot = () => {
        if (!editedSlotData || !editingSlotId) return;

        if (editedSlotData.startTime >= editedSlotData.endTime) {
            alert('Start time must be before end time.');
            return;
        }

        const updatedAvailability = doctor.availability?.map(slot => 
            slot.id === editingSlotId 
                ? { ...slot, startTime: editedSlotData.startTime, endTime: editedSlotData.endTime } 
                : slot
        );
        onUpdateDoctor({ ...doctor, availability: updatedAvailability });
        
        handleEditCancel();
    };

    const groupedSlots = useMemo(() => {
        const groups: { [key in AvailabilitySlot['day']]?: AvailabilitySlot[] } = {};
        daysOfWeek.forEach(day => {
            groups[day] = doctor.availability?.filter(slot => slot.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return groups;
    }, [doctor.availability]);

    return (
        <div className="space-y-6 md:space-y-8">
             <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="font-heading text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <Clock className="mr-3 text-blue-600" />
                    Manage Availability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {daysOfWeek.map(day => (
                        <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3">{day}</h4>
                            <div className="space-y-2">
                                {groupedSlots[day]?.length ? (
                                    groupedSlots[day]!.map(slot => (
                                        <div key={slot.id} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                                            {editingSlotId === slot.id ? (
                                                <div className="flex-1 flex items-center gap-1">
                                                    <input 
                                                        type="time" 
                                                        name="startTime" 
                                                        value={editedSlotData?.startTime || ''}
                                                        onChange={handleEditDataChange}
                                                        className="w-full p-1 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <span className="text-slate-500">-</span>
                                                     <input 
                                                        type="time" 
                                                        name="endTime" 
                                                        value={editedSlotData?.endTime || ''}
                                                        onChange={handleEditDataChange}
                                                        className="w-full p-1 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button onClick={handleUpdateSlot} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Save changes"><Check size={16} /></button>
                                                    <button onClick={handleEditCancel} className="p-1 text-red-500 hover:bg-red-100 rounded-full" title="Cancel edit"><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-medium text-slate-600">{slot.startTime} - {slot.endTime}</span>
                                                    <div className="flex items-center">
                                                         <button onClick={() => handleEditClick(slot)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit slot">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteSlot(slot.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full" title={`Delete slot ${slot.startTime} - ${slot.endTime}`}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 italic text-center py-2">No slots scheduled</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Add New Slot</h3>
                <form onSubmit={handleAddSlot} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                        <select name="day" value={newSlot.day} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                            {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                     <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                        <input type="time" name="startTime" value={newSlot.startTime} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
                    </div>
                     <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                        <input type="time" name="endTime" value={newSlot.endTime} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
                    </div>
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
                        <Plus size={18} className="mr-2" />
                        Add Slot
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorAvailability;
