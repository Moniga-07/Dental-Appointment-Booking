import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { User as UserIcon } from 'lucide-react';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStr));
    
    apiClient.get('/appointments/my-appointments')
      .then(res => setAppointments(res.data.appointments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const today = new Date();
  today.setHours(0,0,0,0);
  const upcoming = appointments.filter(a => new Date(a.date) >= today);
  const past = appointments.filter(a => new Date(a.date) < today);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button asChild>
          <Link to="/book">Book New Appointment</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500">Name</label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Email</label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointments Section */}
        <div className="md:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            {loading ? (
              <div className="text-slate-500">Loading appointments...</div>
            ) : upcoming.length > 0 ? (
              <div className="grid gap-4">
                {upcoming.map(apt => (
                  <Card key={apt.id} className="overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-6 sm:flex justify-between items-center">
                      <div className="space-y-2 mb-4 sm:mb-0">
                        <div className="font-bold text-lg">{apt.service.name}</div>
                        <div className="flex items-center text-slate-500 text-sm gap-4">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {format(parseISO(apt.date), 'MMMM d, yyyy')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {apt.startTime}</span>
                        </div>
                        <div className="text-slate-600 text-sm flex items-center gap-1">
                           <MapPin className="w-4 h-4"/> Dr. {apt.doctor.user.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          apt.status === 'PENDING_CONFIRMATION' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {apt.status.replace('_', ' ')}
                        </div>
                        <div>
                          {apt.status === 'PENDING_CONFIRMATION' && (
                            <p className="text-xs text-amber-600 mt-1 max-w-[200px] text-right">
                              Check WhatsApp to confirm this appointment.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 mb-4">You haven't booked any upcoming appointments.</p>
                <Button asChild variant="outline">
                  <Link to="/book">Book your first visit</Link>
                </Button>
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-slate-400">Past Appointments</h2>
              <div className="grid gap-4 opacity-75">
                {past.map(apt => (
                  <Card key={apt.id} className="overflow-hidden border-l-4 border-l-slate-300">
                    <CardContent className="p-4 sm:flex justify-between items-center bg-slate-50">
                      <div>
                        <div className="font-bold">{apt.service.name}</div>
                        <div className="text-slate-500 text-sm">
                          {format(parseISO(apt.date), 'MMMM d, yyyy')} | Dr. {apt.doctor.user.name}
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-slate-200 text-slate-600">
                          {apt.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
