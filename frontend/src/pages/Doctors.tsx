import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { Link } from 'react-router-dom';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/doctors')
      .then(res => setDoctors(res.data.doctors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Our Specialist Dentists</h1>
        <p className="text-slate-500 text-lg">Meet our team of highly qualified and experienced dental professionals dedicated to providing you with the best care.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-500">Loading dentists...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map(doc => (
            <Card key={doc.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
              <div className="h-64 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {doc.profilePhoto ? (
                  <img src={doc.profilePhoto} alt={doc.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 font-medium text-4xl">🦷</span>
                )}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-1">{doc.user.name}</h3>
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                  {doc.specialty || 'General Dentist'}
                </div>
                <p className="text-slate-600 mb-6 line-clamp-3">
                  {doc.biography || `${doc.user.name} is a dedicated professional committed to ensuring every patient receives the highest standard of dental care.`}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="text-sm">
                    <span className="block text-slate-400">Experience</span>
                    <span className="font-semibold text-slate-700">{doc.experience || '5+'} Years</span>
                  </div>
                  <Button asChild className="rounded-full px-6">
                    <Link to={`/book`}>Book Slot</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {doctors.length === 0 && (
             <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
               No dentists found in the directory. Please check back later.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
