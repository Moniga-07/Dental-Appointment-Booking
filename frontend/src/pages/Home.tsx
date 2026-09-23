import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Stethoscope, ShieldCheck, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-background">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-8">
          Now accepting new patients
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-6 leading-tight">
          Premium Dental Care,<br/>
          <span className="text-primary">Without the Wait.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Book your next dental appointment instantly. Experience world-class care from highly qualified professionals in a comfortable, state-of-the-art clinic.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="text-lg px-8 rounded-full shadow-lg hover:shadow-xl transition-all h-14" asChild>
            <Link to="/book">Book Appointment</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 rounded-full h-14 bg-white/50 backdrop-blur-sm" asChild>
            <Link to="/doctors">Meet Our Dentists</Link>
          </Button>
        </div>
      </section>
      
      <section className="py-24 bg-white dark:bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose DentalCore?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We combine advanced technology with a gentle touch to provide the best possible dental experience.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Calendar className="w-8 h-8 text-primary" />}
              title="Instant Booking"
              description="No phone calls. See real-time availability and book your slot instantly."
            />
            <FeatureCard 
              icon={<Stethoscope className="w-8 h-8 text-primary" />}
              title="Expert Dentists"
              description="Our doctors are highly qualified with years of specialized experience."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-primary" />}
              title="Premium Care"
              description="State-of-the-art facilities ensuring maximum comfort and hygiene."
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Zero Wait Time"
              description="We respect your time. Your appointment starts exactly when scheduled."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm inline-block">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}
