import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function RootLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">DentalCore</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/doctors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dentists</Link>
              <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Services</Link>
              <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {token && user ? (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor' : '/dashboard'} className="text-sm font-medium hover:text-primary flex items-center gap-1">
                  <User className="w-4 h-4"/> Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-1">
                  <LogOut className="w-4 h-4"/>
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium hover:underline">Log in</Link>
            )}
            <Button asChild className="rounded-full px-6">
              <Link to="/book">Book Now</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-12 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>© {new Date().getFullYear()} DentalCore Clinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
