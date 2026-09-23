import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { Calendar, Clock, User, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get('/doctors/me/appointments');
      setAppointments(res.data.appointments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/doctors/me/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
       <h1 className="text-3xl font-bold mb-8">Doctor Schedule</h1>
       
       {loading ? (
         <div className="text-slate-500 p-8 text-center">Loading your schedule...</div>
       ) : (
         <div className="space-y-4">
           {appointments.length === 0 ? (
             <div className="p-12 text-center bg-slate-50 rounded-xl text-slate-500 border border-dashed">
               You have no upcoming appointments.
             </div>
           ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {appointments.map(apt => (
                 <Card key={apt.id} className="overflow-hidden border-t-4 border-t-primary">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                           apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                           apt.status === 'PENDING_CONFIRMATION' ? 'bg-amber-100 text-amber-700' :
                           apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                           'bg-slate-100 text-slate-700'
                         }`}>
                           {apt.status}
                         </span>
                       </div>
                       <div className="text-right">
                         <div className="font-bold text-lg">{format(parseISO(apt.date), 'MMM d')}</div>
                         <div className="text-slate-500 flex items-center justify-end gap-1 text-sm">
                           <Clock className="w-3 h-3" /> {apt.startTime}
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3 mb-6">
                       <div className="flex items-start gap-2">
                         <User className="w-4 h-4 text-slate-400 mt-1" />
                         <div>
                           <div className="font-medium">{apt.patient.user.name}</div>
                           <div className="text-sm text-slate-500">{apt.service.name}</div>
                         </div>
                       </div>
                       {apt.patient.whatsappNumber && (
                         <div className="flex items-center gap-2 text-sm text-slate-600">
                           <Phone className="w-4 h-4 text-slate-400" />
                           {apt.patient.whatsappNumber}
                         </div>
                       )}
                     </div>

                     {(apt.status === 'CONFIRMED' || apt.status === 'PENDING_CONFIRMATION') && (
                       <div className="flex gap-2">
                         <Button className="w-full" size="sm" onClick={() => updateStatus(apt.id, 'COMPLETED')}>
                           Mark Completed
                         </Button>
                         <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(apt.id, 'NO_SHOW')}>
                           No Show
                         </Button>
                       </div>
                     )}
                     
                     {apt.status === 'COMPLETED' && (
                        <div className="text-center text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded">
                          Appointment Completed
                        </div>
                     )}
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
         </div>
       )}
    </div>
  );
}
