import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Card from '../common/Card';
import { InventoryItem, LabReport, Appointment, Patient, Doctor, Department, LabReportStatus, Prescription, PrescriptionStatus, PaymentStatus } from '../../types';
import { incomeReportsData, TOTAL_BEDS } from '../../constants';

interface ReportsProps {
    inventory: InventoryItem[];
    labReports: LabReport[];
    appointments: Appointment[];
    patients: Patient[];
    doctors: Doctor[];
    departments: Department[];
    prescriptions: Prescription[];
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#ef4444'];

const Reports: React.FC<ReportsProps> = ({ inventory, labReports, appointments, patients, doctors, departments, prescriptions }) => {
    const [activeTab, setActiveTab] = useState('financial');

    // Financial calculations
    const financialStats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyLabIncome = labReports
            .filter(report => {
                if (report.status !== LabReportStatus.Completed || !report.testFee || report.paymentStatus !== PaymentStatus.Paid) return false;
                const reportDate = new Date(report.reportDate);
                return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
            })
            .reduce((sum, report) => sum + (report.testFee || 0), 0);
            
        const monthlyPharmacyIncome = prescriptions
            .filter(p => {
                if (p.status !== PrescriptionStatus.Fulfilled || p.paymentStatus !== PaymentStatus.Paid || !p.dateFulfilled) return false;
                const fulfilledDate = new Date(p.dateFulfilled);
                return fulfilledDate.getMonth() === currentMonth && fulfilledDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

        const currentMonthStaticData = incomeReportsData[incomeReportsData.length - 1]; // Fallback for booking
        const totalIncomeYTD = incomeReportsData.reduce((acc, month) => acc + month.pharmacy + month.lab + month.booking, 0);

        return {
            monthlyLabIncome,
            monthlyPharmacyIncome,
            monthlyBookingIncome: currentMonthStaticData.booking,
            totalIncomeYTD,
        }
    }, [labReports, prescriptions]);
    
     const chartData = useMemo(() => {
        const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
        const updatedData = [...incomeReportsData];
        const currentMonthIndex = updatedData.findIndex(d => d.month === currentMonthName);
        
        if (currentMonthIndex !== -1) {
            updatedData[currentMonthIndex] = {
                ...updatedData[currentMonthIndex],
                pharmacy: financialStats.monthlyPharmacyIncome,
                lab: financialStats.monthlyLabIncome,
            };
        }
        return updatedData;
    }, [financialStats]);

    // Operational calculations
    const operationalStats = useMemo(() => {
        const admittedPatients = patients.filter(p => p.admitDate && !p.dischargeDate).length;
        const occupancyRate = TOTAL_BEDS > 0 ? ((admittedPatients / TOTAL_BEDS) * 100).toFixed(1) : '0.0';

        const dischargedPatients = patients.filter(p => p.admitDate && p.dischargeDate);
        const totalStayDays = dischargedPatients.reduce((acc, p) => {
            if (p.admitDate && p.dischargeDate) {
                const admitTime = Date.parse(p.admitDate);
                const dischargeTime = Date.parse(p.dischargeDate);
                if (!isNaN(admitTime) && !isNaN(dischargeTime)) {
                    const diffTime = Math.abs(dischargeTime - admitTime);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return acc + diffDays;
                }
            }
            return acc;
        }, 0);
        const avgStay = dischargedPatients.length > 0 ? (totalStayDays / dischargedPatients.length).toFixed(1) : '0';

        const appointmentsByDept = appointments.reduce((acc, apt) => {
            const deptName = departments.find(d => d.id === apt.departmentId)?.name || 'Unknown';
            acc[deptName] = (acc[deptName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        // FIX: Explicitly cast sort operands to numbers to satisfy TypeScript compiler.
        const topDept = Object.entries(appointmentsByDept).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'N/A';


        return { occupancyRate, avgStay, topDept, appointmentsByDept };
    }, [patients, appointments, departments]);

    const patientDemographicsData = useMemo(() => {
        const genderCounts = patients.reduce((acc, p) => {
            acc[p.gender] = (acc[p.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
    }, [patients]);
    
    const appointmentsByDeptData = useMemo(() => 
        Object.entries(operationalStats.appointmentsByDept).map(([name, value]) => ({ name, appointments: value })),
        [operationalStats.appointmentsByDept]
    );
    
    const doctorWorkloadData = useMemo(() => {
        const appointmentsByDoctor = appointments.reduce((acc, apt) => {
            const docName = doctors.find(d => d.id === apt.doctorId)?.name || 'Unknown';
            acc[docName] = (acc[docName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        // FIX: Explicitly cast sort operands to numbers to satisfy TypeScript compiler.
        return Object.entries(appointmentsByDoctor).map(([name, count]) => ({ name, appointmentCount: count })).sort((a,b) => Number(b.appointmentCount) - Number(a.appointmentCount));
    }, [appointments, doctors]);

    const renderFinancialSummary = () => (
        <div className="space-y-6 md:space-y-8 animate-fade-in-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card title="Total Income (YTD)" value={`₹${financialStats.totalIncomeYTD.toLocaleString('en-IN')}`} icon="TrendingUp" color="blue" />
                <Card title="Pharmacy Income (Month)" value={`₹${financialStats.monthlyPharmacyIncome.toLocaleString('en-IN')}`} icon="Pill" color="green" />
                <Card title="Lab Income (Month)" value={`₹${financialStats.monthlyLabIncome.toLocaleString('en-IN')}`} icon="Beaker" color="violet" />
                <Card title="Booking Income (Month)" value={`₹${financialStats.monthlyBookingIncome.toLocaleString('en-IN')}`} icon="CalendarDays" color="red" />
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
              <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Monthly Income Breakdown</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `₹${value/1000}k`} stroke="#64748b"/>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}} 
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: '20px'}}/>
                  <Area type="monotone" dataKey="pharmacy" stackId="1" stroke="#16a34a" fill="url(#colorGreen)" name="Pharmacy"/>
                  <Area type="monotone" dataKey="lab" stackId="1" stroke="#7c3aed" fill="url(#colorViolet)" name="Lab"/>
                  <Area type="monotone" dataKey="booking" stackId="1" stroke="#ef4444" fill="url(#colorRed)" name="Bookings"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
              <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Income Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Month</th>
                            <th scope="col" className="px-6 py-3">Pharmacy Income</th>
                            <th scope="col" className="px-6 py-3">Lab Income</th>
                            <th scope="col" className="px-6 py-3">Booking Income</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Total Monthly Income</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((row) => (
                            <tr key={row.month} className="bg-white border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{row.month}</td>
                                <td className="px-6 py-4">₹{row.pharmacy.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4">₹{row.lab.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4">₹{row.booking.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">₹{(row.pharmacy + row.lab + row.booking).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>
        </div>
    );

    const renderOperationalAnalytics = () => (
        <div className="space-y-6 md:space-y-8 animate-fade-in-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card title="Bed Occupancy Rate" value={`${operationalStats.occupancyRate}%`} icon="BedDouble" color="blue" />
                <Card title="Avg. Patient Stay" value={`${operationalStats.avgStay} days`} icon="Clock" color="violet" />
                <Card title="Total Appointments" value={appointments.length.toString()} icon="Calendar" color="green" />
                <Card title="Busiest Department" value={operationalStats.topDept} icon="Building" color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                    <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Patient Demographics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={patientDemographicsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={(props) => {
                                const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return ( <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text> );
                            }}>
                                {patientDemographicsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}}
                            />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: '20px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                    <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Appointments by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={appointmentsByDeptData}>
                            <defs>
                                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b"/>
                            <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#64748b"/>
                            <Tooltip 
                                cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} 
                                contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}}
                            />
                            <Bar dataKey="appointments" fill="url(#colorAppointments)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
              <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Doctor Workload</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Doctor Name</th>
                            <th scope="col" className="px-6 py-3">Appointments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctorWorkloadData.map((row) => (
                            <tr key={row.name} className="bg-white border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{row.appointmentCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-heading text-2xl font-bold text-slate-800">Reports</h2>
                <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('financial')} className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'financial' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300/50'}`}>Financial</button>
                    <button onClick={() => setActiveTab('operational')} className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'operational' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300/50'}`}>Operational</button>
                </div>
            </div>
            {activeTab === 'financial' ? renderFinancialSummary() : renderOperationalAnalytics()}
        </div>
    );
};

export default Reports;