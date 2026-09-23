import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">About DentalCore Clinic</h1>
        <p className="text-slate-500 text-lg">Redefining modern dentistry with a commitment to excellence, comfort, and advanced technology.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6 text-lg text-slate-700">
          <p>
            Founded in 2020, DentalCore Clinic was established with a singular vision: to make high-quality dental care accessible, comfortable, and anxiety-free. 
          </p>
          <p>
            We believe that a beautiful smile is connected to overall health and well-being. That is why our team of highly specialized dentists, orthodontists, and hygienists work collaboratively to provide comprehensive care tailored to your unique needs.
          </p>
          <p>
            Our clinic is equipped with the latest diagnostic technology, ensuring precise treatments ranging from routine cleanings to complex restorative procedures.
          </p>
        </div>
        <div>
          <div className="bg-slate-200 rounded-3xl h-[400px] w-full overflow-hidden shadow-lg">
            <img 
              src="/images/clinic_interior.png" 
              alt="DentalCore Clinic Interior" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card className="border-none shadow-md">
          <CardContent className="p-8">
            <h3 className="text-4xl font-black text-primary mb-2">10k+</h3>
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Happy Patients</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-8">
            <h3 className="text-4xl font-black text-primary mb-2">15+</h3>
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Specialist Doctors</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-8">
            <h3 className="text-4xl font-black text-primary mb-2">100%</h3>
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Pain-Free Approach</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
