import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { Users, Calendar, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'doctors'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', duration: '30', price: '100' });
  const [doctorForm, setDoctorForm] = useState({ email: '', password: '', name: '', phone: '', specialty: '', experience: '5', consultationFee: '100', biography: '' });
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, aptsRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/admin/appointments')
      ]);
      setStats(statsRes.data.stats);
      setAppointments(aptsRes.data.appointments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/services', serviceForm);
      setMessage('Service added successfully!');
      setServiceForm({ name: '', description: '', duration: '30', price: '100' });
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to add service');
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/doctors', doctorForm);
      setMessage('Doctor created successfully!');
      setDoctorForm({ email: '', password: '', name: '', phone: '', specialty: '', experience: '5', consultationFee: '100', biography: '' });
      fetchData(); // Refresh stats
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading admin data...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex space-x-2 border-b border-slate-200 mb-8 pb-px">
        {['overview', 'services', 'doctors'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium text-sm capitalize rounded-t-lg transition-colors ${
              activeTab === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {message && <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">{message}</div>}

      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <StatCard icon={<Calendar className="w-6 h-6 text-blue-600"/>} title="Total Appointments" value={stats?.totalAppointments || 0} />
            <StatCard icon={<Users className="w-6 h-6 text-green-600"/>} title="Total Patients" value={stats?.totalPatients || 0} />
            <StatCard icon={<Activity className="w-6 h-6 text-purple-600"/>} title="Active Doctors" value={stats?.activeDoctors || 0} />
            <StatCard icon={<CheckCircle2 className="w-6 h-6 text-orange-600"/>} title="Appointments Today" value={stats?.appointmentsToday || 0} />
          </div>

          <h2 className="text-xl font-semibold mb-6">Recent Appointments</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date / Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 10).map((apt) => (
                    <tr key={apt.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs">{apt.appointmentId}</td>
                      <td className="px-6 py-4 font-medium">{apt.patient.user.name}</td>
                      <td className="px-6 py-4 text-slate-500">{apt.doctor.user.name}</td>
                      <td className="px-6 py-4">{apt.service.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(apt.date).toLocaleDateString()} <br/>
                        <span className="text-slate-400">{apt.startTime} - {apt.endTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          apt.status === 'PENDING_CONFIRMATION' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <Card className="max-w-2xl animate-in fade-in">
          <CardHeader>
            <CardTitle>Create New Service</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddService} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Name</label>
                <Input required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input required value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input type="number" required value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input type="number" required value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">Save Service</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'doctors' && (
        <Card className="max-w-2xl animate-in fade-in">
          <CardHeader>
            <CardTitle>Register New Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input required value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input required value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" required value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Temporary Password</label><Input type="password" required value={doctorForm.password} onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Specialty</label><Input required value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Experience (Years)</label><Input type="number" required value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Consultation Fee ($)</label><Input type="number" required value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Biography</label>
                <Input required value={doctorForm.biography} onChange={e => setDoctorForm({...doctorForm, biography: e.target.value})} />
              </div>
              <Button type="submit" className="w-full mt-4">Create Doctor Account</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: any, title: string, value: number }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
