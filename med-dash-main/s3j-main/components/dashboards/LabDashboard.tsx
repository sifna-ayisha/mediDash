import React, { useState, useMemo } from 'react';
import { Beaker, Search, Edit, Clock, CheckCircle, FileText, FlaskConical, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LabReport, Patient, Doctor, LabReportStatus, ClinicSettings } from '../../types';
import Modal from '../common/Modal';
import Card from '../common/Card';
import SampleTracking from '../lab/SampleTracking';
import LabFinalReports from '../lab/LabFinalReports';
import LabReportForm from '../lab/LabReportForm';
import LabBilling from '../lab/LabBilling';

interface LabDashboardProps {
    activeView: string;
    labReports: LabReport[];
    setLabReports: React.Dispatch<React.SetStateAction<LabReport[]>>;
    patients: Patient[];
    doctors: Doctor[];
    clinicSettings: ClinicSettings;
}

const getStatusColor = (status: LabReportStatus) => {
    switch(status) {
        case LabReportStatus.Completed: return 'bg-green-100 text-green-800';
        case LabReportStatus.Processing: return 'bg-amber-100 text-amber-800';
        case LabReportStatus.Pending: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const LabDashboard: React.FC<LabDashboardProps> = ({ activeView, labReports, setLabReports, patients, doctors, clinicSettings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LabReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const reportsWithDetails = useMemo(() => {
    return labReports.map(report => ({
        ...report,
        patientName: patients.find(p => p.id === report.patientId)?.name || 'N/A',
        doctorName: doctors.find(d => d.id === report.doctorId)?.name || 'N/A',
    })).sort((a,b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
  }, [labReports, patients, doctors]);

  const filteredReports = useMemo(() => 
    reportsWithDetails.filter(report => 
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase())
    ), [reportsWithDetails, searchTerm]);

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
            pending: labReports.filter(r => r.status === LabReportStatus.Pending).length,
            processing: labReports.filter(r => r.status === LabReportStatus.Processing).length,
            completed: labReports.filter(r => r.status === LabReportStatus.Completed).length,
            completedToday: labReports.filter(r => r.status === LabReportStatus.Completed && r.reportDate === today).length,
            total: labReports.length,
        };
    }, [labReports]);

  const handleUpdateClick = (report: LabReport) => {
      setEditingReport(report);
      setIsModalOpen(true);
  };

  const handleCreateClick = () => {
      setEditingReport(null);
      setIsModalOpen(true);
  }
  
  const handleSave = (reportToSave: LabReport) => {
      if (editingReport) { // It's an update
          setLabReports(prev => prev.map(r => r.id === reportToSave.id ? reportToSave : r));
      } else { // It's a new report
          setLabReports(prev => [reportToSave, ...prev]);
      }
      setIsModalOpen(false);
      setEditingReport(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const TestRequestsView = () => (
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="font-heading text-xl font-semibold text-slate-700 flex items-center">
            <Beaker className="mr-3 text-violet-600" />
            Laboratory Test Queue
          </h3>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search tests..." 
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
             <button onClick={handleCreateClick} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
                <Plus size={16} className="mr-2" />
                <span>Create Report</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Request ID</th>
                <th scope="col" className="px-6 py-3">Patient</th>
                <th scope="col" className="px-6 py-3">Test Name</th>
                <th scope="col" className="px-6 py-3 hidden md:table-cell">Doctor</th>
                <th scope="col" className="px-6 py-3 hidden lg:table-cell">Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((req) => (
                <tr key={req.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-700">{req.reportId}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{req.patientName}</td>
                  <td className="px-6 py-4">{req.testName}</td>
                  <td className="px-6 py-4 hidden md:table-cell">{req.doctorName}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{req.reportDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleUpdateClick(req)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Update Report">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
  
  const PIE_COLORS = {
    'Pending': '#ef4444',
    'Processing': '#f59e0b',
    'Completed': '#22c55e',
  };

  const DashboardView = () => {
    const pieData = [
        { name: 'Pending', value: stats.pending },
        { name: 'Processing', value: stats.processing },
        { name: 'Completed', value: stats.completed },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card title="Pending Requests" value={stats.pending.toString()} icon="Clock" color="red" />
            <Card title="Tests in Progress" value={stats.processing.toString()} icon="FlaskConical" color="amber" />
            <Card title="Completed Today" value={stats.completedToday.toString()} icon="CheckCircle" color="green" />
            <Card title="Total Reports" value={stats.total.toString()} icon="FileText" color="violet" />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8">
            <div className="xl:col-span-3">
                <TestRequestsView />
            </div>
            <div className="xl:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-smooth">
                <h3 className="font-heading text-lg font-semibold text-slate-700 mb-4">Test Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={(props) => {
                                const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return ( <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text> );
                            }}>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px -1px rgba(0,0,0,0.07)'}}/>
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: '20px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
  )};

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Test Requests':
        return <TestRequestsView />;
      case 'Sample Tracking':
        return <SampleTracking labReports={labReports} setLabReports={setLabReports} patients={patients} />;
      case 'Reports':
        return <LabFinalReports reports={reportsWithDetails} clinicSettings={clinicSettings} patients={patients} />;
      case 'Lab Billing':
        return <LabBilling 
            labReports={labReports} 
            setLabReports={setLabReports} 
            patients={patients} 
            doctors={doctors}
        />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      {renderContent()}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel} 
        title={editingReport ? `Update Report: ${editingReport.reportId}` : 'Create New Lab Report'}
      >
        {isModalOpen && <LabReportForm 
            report={editingReport} 
            patients={patients}
            doctors={doctors}
            onSave={handleSave} 
            onCancel={handleCancel} 
        />}
      </Modal>
    </>
  );
};

export default LabDashboard;