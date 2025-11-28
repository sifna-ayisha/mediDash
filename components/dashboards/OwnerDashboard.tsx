import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { LabReport, Prescription, LabReportStatus, PrescriptionStatus, PaymentStatus, Appointment, Department, Doctor, Patient, LeaveRequest, LeaveStatus } from '../../types';
import { incomeReportsData } from '../../constants';
import DoctorPerformance from '../owner/DoctorPerformance';
import { Activity, CalendarCheck, FilePlus, TestTube2, CalendarOff, CheckCircle, Clock, Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

interface OwnerDashboardProps {
    labReports: LabReport[];
    prescriptions: Prescription[];
    appointments: Appointment[];
    departments: Department[];
    doctors: Doctor[];
    patients: Patient[];
    leaveRequests: LeaveRequest[];
}

const departmentColors: { [key: string]: string } = {
    'Cardiology': 'red',
    'Neurology': 'amber',
    'Pediatrics': 'slate',
};

const departmentStrokeColors: { [key: string]: string } = {
    'Cardiology': '#ef4444',
    'Neurology': '#f59e0b',
    'Pediatrics': '#64748b',
};

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ labReports, prescriptions, appointments, departments, doctors, patients, leaveRequests }) => {

    const financialStats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyPharmacyIncome = prescriptions
            .filter(p => {
                if (p.status !== PrescriptionStatus.Fulfilled || p.paymentStatus !== PaymentStatus.Paid || !p.dateFulfilled) return false;
                const fulfilledDate = new Date(p.dateFulfilled);
                return fulfilledDate.getMonth() === currentMonth && fulfilledDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        
        const ytdPharmacyIncome = prescriptions
            .filter(p => {
                 if (p.status !== PrescriptionStatus.Fulfilled || p.paymentStatus !== PaymentStatus.Paid || !p.dateFulfilled) return false;
                const fulfilledDate = new Date(p.dateFulfilled);
                return fulfilledDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

        const monthlyLabIncome = labReports
            .filter(report => {
                if (report.status !== LabReportStatus.Completed || !report.testFee || report.paymentStatus !== PaymentStatus.Paid) return false;
                const reportDate = new Date(report.reportDate);
                return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
            })
            .reduce((sum, report) => sum + (report.testFee || 0), 0);
            
        const ytdLabIncome = labReports
            .filter(report => {
                 if (report.status !== LabReportStatus.Completed || !report.testFee || report.paymentStatus !== PaymentStatus.Paid) return false;
                const reportDate = new Date(report.reportDate);
                return reportDate.getFullYear() === currentYear;
            })
            .reduce((sum, report) => sum + (report.testFee || 0), 0);
            
        const monthlyDepartmentIncome = departments.reduce((acc, dept) => {
            const deptIncome = appointments
                .filter(apt => {
                    if (apt.departmentId !== dept.id) return false;
                    const aptDate = new Date(apt.date);
                    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
                })
                .reduce((sum, apt) => sum + apt.consultationFee, 0);
            acc[dept.name] = deptIncome;
            return acc;
        }, {} as Record<string, number>);

        const ytdAppointmentsIncome = appointments
            .filter(apt => new Date(apt.date).getFullYear() === currentYear)
            .reduce((sum, apt) => sum + apt.consultationFee, 0);

        const totalIncomeYTD = ytdPharmacyIncome + ytdLabIncome + ytdAppointmentsIncome;

        return {
            monthlyLabIncome,
            monthlyPharmacyIncome,
            monthlyDepartmentIncome,
            totalIncomeYTD,
        }
    }, [labReports, prescriptions, appointments, departments]);
    
     const chartData = useMemo(() => {
        const departmentNames = departments.map(d => d.name);
        
        const mockDistribution = 1 / (departmentNames.length || 1);

        const updatedData = incomeReportsData.map(monthData => {
            const { booking, ...rest } = monthData;
            const departmentIncomes: { [key: string]: number } = {};
            departmentNames.forEach(name => {
                departmentIncomes[name] = booking * mockDistribution;
            });
            return { ...rest, ...departmentIncomes };
        });
        
        const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
        const currentMonthIndex = updatedData.findIndex(d => d.month === currentMonthName);
        
        if (currentMonthIndex !== -1) {
            updatedData[currentMonthIndex].pharmacy = financialStats.monthlyPharmacyIncome;
            updatedData[currentMonthIndex].lab = financialStats.monthlyLabIncome;
            departmentNames.forEach(name => {
                updatedData[currentMonthIndex][name] = financialStats.monthlyDepartmentIncome[name] || 0;
            });
        }
        return updatedData;
    }, [financialStats, departments]);
    
    const departmentNames = useMemo(() => departments.map(d => d.name), [departments]);

    const doctorActivity = useMemo(() => {
        const activities: any[] = [];
        
        appointments.forEach(a => {
            if (a.status === 'Completed') {
                activities.push({
                    id: a.id,
                    type: 'Appointment',
                    doctorName: doctors.find(d => d.id === a.doctorId)?.name || 'Unknown',
                    detail: `Completed appointment with ${patients.find(p => p.id === a.patientId)?.name}`,
                    date: a.date,
                    timestamp: new Date(`${a.date}T${a.time}`).getTime()
                });
            }
        });

        prescriptions.forEach(p => {
            activities.push({
                id: p.id,
                type: 'Prescription',
                doctorName: doctors.find(d => d.id === p.doctorId)?.name || 'Unknown',
                detail: `Issued prescription for ${p.medicineName}`,
                date: p.dateIssued,
                timestamp: new Date(p.dateIssued).getTime()
            });
        });

        labReports.forEach(l => {
            if (l.status === LabReportStatus.Completed) {
                activities.push({
                    id: l.id,
                    type: 'Lab Report',
                    doctorName: doctors.find(d => d.id === l.doctorId)?.name || 'Unknown',
                    detail: `Completed lab report: ${l.testName}`,
                    date: l.reportDate,
                    timestamp: new Date(l.reportDate).getTime()
                });
            }
        });

        return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    }, [appointments, prescriptions, labReports, doctors, patients]);

    const upcomingLeaves = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);

        return leaveRequests
            .filter(req => req.status === LeaveStatus.Approved || req.status === LeaveStatus.Pending)
            .filter(req => new Date(req.endDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 5);
    }, [leaveRequests]);

    const getActivityIcon = (type: string) => {
        switch(type) {
            case 'Appointment': return <CalendarCheck size={16} className="text-blue-600" />;
            case 'Prescription': return <FilePlus size={16} className="text-green-600" />;
            case 'Lab Report': return <TestTube2 size={16} className="text-violet-600" />;
            default: return <Activity size={16} className="text-slate-600" />;
        }
    };

    const handleExportData = () => {
        const wb = utils.book_new();

        // 1. Financial Summary Sheet
        const summaryData = [
            { Metric: 'Total Income (YTD)', Value: financialStats.totalIncomeYTD },
            { Metric: 'Pharmacy Income (Month)', Value: financialStats.monthlyPharmacyIncome },
            { Metric: 'Lab Income (Month)', Value: financialStats.monthlyLabIncome },
            ...Object.entries(financialStats.monthlyDepartmentIncome).map(([dept, val]) => ({ Metric: `${dept} Income (Month)`, Value: val }))
        ];
        const summaryWs = utils.json_to_sheet(summaryData);
        utils.book_append_sheet(wb, summaryWs, "Financial Summary");

        // 2. Monthly Trends Sheet
        const trendsWs = utils.json_to_sheet(chartData);
        utils.book_append_sheet(wb, trendsWs, "Monthly Trends");

        // 3. Doctor Performance Sheet
        const doctorStats = doctors.map(doc => {
             const docApts = appointments.filter(a => a.doctorId === doc.id);
             const consultRev = docApts.filter(a => a.paymentStatus === PaymentStatus.Paid).reduce((sum, a) => sum + a.consultationFee, 0);

             const docRx = prescriptions.filter(p => p.doctorId === doc.id && p.status === PrescriptionStatus.Fulfilled && p.paymentStatus === PaymentStatus.Paid);
             const rxRev = docRx.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

             const docLab = labReports.filter(r => r.doctorId === doc.id && r.status === LabReportStatus.Completed && r.paymentStatus === PaymentStatus.Paid);
             const labRev = docLab.reduce((sum, r) => sum + (r.testFee || 0), 0);

             return {
                 Name: doc.name,
                 Specialty: doc.specialty,
                 Appointments: docApts.length,
                 Consultation_Revenue: consultRev,
                 Pharmacy_Revenue: rxRev,
                 Lab_Revenue: labRev,
                 Total_Revenue: consultRev + rxRev + labRev
             };
        });
        const docWs = utils.json_to_sheet(doctorStats);
        utils.book_append_sheet(wb, docWs, "Doctor Performance");

        // 4. Recent Activity Sheet
        const activityWs = utils.json_to_sheet(doctorActivity.map(act => ({
            Type: act.type,
            Doctor: act.doctorName,
            Date: act.date,
            Details: act.detail
        })));
        utils.book_append_sheet(wb, activityWs, "Recent Activity");
        
        // 5. Leaves Sheet
        const leavesWs = utils.json_to_sheet(leaveRequests.map(req => ({
            Doctor: doctors.find(d => d.id === req.doctorId)?.name || 'Unknown',
            StartDate: req.startDate,
            EndDate: req.endDate,
            Reason: req.reason,
            Status: req.status,
            RequestDate: req.requestDate
        })));
        utils.book_append_sheet(wb, leavesWs, "Leave Requests");

        writeFile(wb, `MediDash_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in-down">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-heading text-2xl font-bold text-slate-800">Financial Overview</h2>
                <button onClick={handleExportData} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm">
                    <Download size={18} className="mr-2" />
                    Export Data
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <Card title="Total Income (YTD)" value={`₹${financialStats.totalIncomeYTD.toLocaleString('en-IN')}`} icon="TrendingUp" color="blue" />
                <Card title="Pharmacy Income (Month)" value={`₹${financialStats.monthlyPharmacyIncome.toLocaleString('en-IN')}`} icon="Pill" color="green" />
                <Card title="Lab Income (Month)" value={`₹${financialStats.monthlyLabIncome.toLocaleString('en-IN')}`} icon="Beaker" color="violet" />
                {Object.entries(financialStats.monthlyDepartmentIncome).map(([deptName, income]) => (
                    <Card 
                        key={deptName}
                        title={`${deptName} Income (Month)`} 
                        value={`₹${Number(income).toLocaleString('en-IN')}`} 
                        icon="Building" 
                        color={departmentColors[deptName] || 'slate'}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                    <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Monthly Income Breakdown</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient>
                            {departmentNames.map((name) => (
                                <linearGradient key={name} id={`colorDept${name}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={departmentStrokeColors[name] || '#64748b'} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={departmentStrokeColors[name] || '#64748b'} stopOpacity={0}/>
                                </linearGradient>
                            ))}
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
                        {departmentNames.map((name) => (
                            <Area 
                                key={name}
                                type="monotone" 
                                dataKey={name}
                                stackId="1"
                                stroke={departmentStrokeColors[name] || '#64748b'}
                                fill={`url(#colorDept${name})`} 
                                name={name}
                            />
                        ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth flex flex-col">
                    <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <Activity className="mr-2 text-slate-500" size={20}/>
                        Recent Doctor Activity
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 max-h-[400px] space-y-4">
                        {doctorActivity.length > 0 ? (
                            doctorActivity.map((act) => (
                                <div key={act.id} className="flex items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div className="mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 mr-3 shrink-0">
                                        {getActivityIcon(act.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{act.doctorName}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{act.detail}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{act.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No recent activity recorded.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Doctor Leaves Section */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                 <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4 flex items-center">
                    <CalendarOff className="mr-2 text-slate-500" size={20}/>
                    Upcoming Doctor Leaves
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Doctor</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingLeaves.length > 0 ? (
                                upcomingLeaves.map(leave => (
                                    <tr key={leave.id} className="border-b border-slate-100 last:border-0">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {doctors.find(d => d.id === leave.doctorId)?.name || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {leave.startDate} to {leave.endDate}
                                        </td>
                                        <td className="px-4 py-3 truncate max-w-xs">{leave.reason}</td>
                                        <td className="px-4 py-3">
                                             <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit ${leave.status === LeaveStatus.Approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {leave.status === LeaveStatus.Approved ? <CheckCircle size={12} className="mr-1"/> : <Clock size={12} className="mr-1"/>}
                                                {leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-slate-500">No upcoming leaves.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DoctorPerformance 
                doctors={doctors} 
                appointments={appointments} 
                prescriptions={prescriptions}
                labReports={labReports}
            />
            
                        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-heading text-lg font-semibold text-slate-700">Income Data</h3>
                                <button
                                        type="button"
                                        onClick={() => {
                                                const rows = chartData.map(r => {
                                                        const base: any = { Month: r.month, Pharmacy: r.pharmacy, Lab: r.lab };
                                                        departmentNames.forEach(name => { base[name] = (r as any)[name] || 0; });
                                                        base.Total = Object.values(base).slice(1).reduce((s: number, v: any) => s + Number(v || 0), 0);
                                                        return base;
                                                });
                                                const ws = utils.json_to_sheet(rows);
                                                const wb = utils.book_new();
                                                utils.book_append_sheet(wb, ws, 'Income Data');
                                                writeFile(wb, `income-data-${new Date().toISOString().split('T')[0]}.xlsx`);
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                >
                                        Export Income
                                </button>
                            </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Month</th>
                            <th scope="col" className="px-6 py-3">Pharmacy</th>
                            <th scope="col" className="px-6 py-3">Lab</th>
                            {departmentNames.map(name => <th key={name} scope="col" className="px-6 py-3">{name}</th>)}
                            <th scope="col" className="px-6 py-3 font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((row) => {
                            const total = row.pharmacy + row.lab + departmentNames.reduce((acc, name) => acc + Number((row as any)[name] || 0), 0);
                            return (
                                <tr key={row.month} className="bg-white border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{row.month}</td>
                                    <td className="px-6 py-4">₹{row.pharmacy.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4">₹{row.lab.toLocaleString('en-IN')}</td>
                                    {departmentNames.map(name => <td key={name} className="px-6 py-4">₹{Number((row as any)[name] || 0).toLocaleString('en-IN')}</td>)}
                                    <td className="px-6 py-4 font-semibold text-slate-800">₹{total.toLocaleString('en-IN')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;