import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/api/client";
import { format } from "date-fns";

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/doctors').then(res => setDoctors(res.data.doctors)).catch(console.error);
    apiClient.get('/services').then(res => setServices(res.data.services)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedService && selectedDate) {
      setLoading(true);
      apiClient.get(`/appointments/available-slots`, {
        params: { doctorId: selectedDoctor, serviceId: selectedService, date: selectedDate }
      })
      .then(res => {
        setSlots(res.data.slots || []);
        setLoading(false);
      })
      .catch(() => {
        setSlots([]);
        setLoading(false);
      });
    }
  }, [selectedDoctor, selectedService, selectedDate]);

  const handleBook = async () => {
    setError(null);
    try {
      setLoading(true);
      await apiClient.post('/appointments/book', {
        doctorId: selectedDoctor,
        serviceId: selectedService,
        date: selectedDate,
        startTime: selectedSlot
      });
      setBookingSuccess(true);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment. Are you logged in as a patient?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Your Appointment</h1>
      
      {step < 5 && (
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select a Dentist</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <Card 
                key={doc.id} 
                className={`cursor-pointer transition-all ${selectedDoctor === doc.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedDoctor(doc.id)}
              >
                <CardContent className="p-6">
                  <div className="font-bold text-lg">{doc.user.name}</div>
                  <div className="text-slate-500 text-sm">{doc.specialty || 'General Dentist'}</div>
                  <div className="text-slate-500 text-sm mt-2">Consultation Fee: ${doc.consultationFee}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selectedDoctor}>Next Step</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map(srv => (
              <Card 
                key={srv.id} 
                className={`cursor-pointer transition-all ${selectedService === srv.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedService(srv.id)}
              >
                <CardContent className="p-6">
                  <div className="font-bold text-lg">{srv.name}</div>
                  <div className="text-slate-500 text-sm mt-1">{srv.description}</div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-medium">${srv.price}</span>
                    <span className="text-sm text-slate-500">{srv.duration} mins</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedService}>Next Step</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full md:w-1/2 p-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Available Slots</label>
            {loading ? (
              <div className="text-slate-500">Finding available slots...</div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {slots.map((slot, idx) => (
                  <Button
                    key={idx}
                    variant={selectedSlot === slot.startTime ? 'default' : 'outline'}
                    onClick={() => setSelectedSlot(slot.startTime)}
                    className="w-full"
                  >
                    {slot.startTime}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-amber-600 bg-amber-50 p-4 rounded-md">
                No slots available on this date. Please select another date.
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)} disabled={!selectedSlot}>Review Booking</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Review Your Booking</h2>
          <Card>
            <CardContent className="p-6 space-y-4 text-lg">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold">{selectedDate}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Time:</span>
                <span className="font-bold">{selectedSlot}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Dentist:</span>
                <span className="font-bold">{doctors.find(d => d.id === selectedDoctor)?.user.name}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold">{services.find(s => s.id === selectedService)?.name}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mt-4 text-sm">
            You will receive a WhatsApp message to confirm this appointment. 
            If not confirmed, the slot may be released.
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            {isAuthenticated ? (
              <Button onClick={handleBook} disabled={loading} size="lg">
                {loading ? 'Booking...' : 'Confirm Appointment Request'}
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} size="lg" className="bg-amber-600 hover:bg-amber-700">
                Log in to Book
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 5 && bookingSuccess && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h2 className="text-3xl font-bold mb-4">Booking Requested!</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
            We've sent a confirmation request to your WhatsApp number. Please check your phone to finalize the appointment.
          </p>
          <Button size="lg" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
