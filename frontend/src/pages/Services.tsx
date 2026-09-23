import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    { name: 'Teeth Cleaning & Polishing', description: 'Comprehensive dental cleaning to remove plaque, tartar, and stains, leaving your teeth sparkling clean.', duration: '30 mins', price: '$50', icon: '✨' },
    { name: 'Root Canal Therapy', description: 'Expert endodontic treatment to save infected or damaged teeth and relieve severe pain.', duration: '90 mins', price: '$400', icon: '🦷' },
    { name: 'Laser Teeth Whitening', description: 'Professional teeth whitening service that can brighten your smile by up to 8 shades in a single visit.', duration: '60 mins', price: '$150', icon: '💎' },
    { name: 'Dental Implants', description: 'Permanent, natural-looking tooth replacements that restore both function and aesthetics.', duration: '120 mins', price: '$1200', icon: '🔩' },
    { name: 'Orthodontics (Invisalign)', description: 'Clear aligner therapy for straightening teeth discreetly and comfortably.', duration: '45 mins', price: '$200', icon: '😁' },
    { name: 'Pediatric Dentistry', description: 'Gentle and fun dental care specially tailored for children to build healthy habits early.', duration: '30 mins', price: '$60', icon: '🧸' },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Our Dental Services</h1>
        <p className="text-slate-500 text-lg">We offer a comprehensive range of dental treatments using state-of-the-art technology to ensure you receive the highest quality care.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((srv, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all border-none shadow-md overflow-hidden group">
            <CardContent className="p-8">
              <div className="text-5xl mb-6 bg-primary/5 w-20 h-20 flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                {srv.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{srv.name}</h3>
              <p className="text-slate-600 mb-6">{srv.description}</p>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div>
                  <div className="font-bold text-xl text-primary">{srv.price}</div>
                  <div className="text-sm text-slate-400">{srv.duration}</div>
                </div>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/book">Book Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
