import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// Protect all admin routes
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const totalAppointments = await prisma.appointment.count();
    const totalPatients = await prisma.profilePatient.count();
    const activeDoctors = await prisma.profileDoctor.count({ where: { isActive: true } });
    
    // Appointments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    res.json({
      success: true,
      stats: {
        totalAppointments,
        totalPatients,
        activeDoctors,
        appointmentsToday
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/appointments', async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        service: true,
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
});

router.post('/services', async (req, res, next) => {
  try {
    const { name, description, duration, price } = req.body;
    const service = await prisma.service.create({
      data: { name, description, duration: parseInt(duration), price: parseFloat(price) }
    });
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
});

router.post('/doctors', async (req, res, next) => {
  try {
    const { email, password, name, phone, specialty, experience, consultationFee, biography } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const doctor = await prisma.user.create({
      data: {
        email, password: hashedPassword, name, phone, role: 'DOCTOR',
        doctor: {
          create: {
            specialty,
            experience: parseInt(experience) || 0,
            consultationFee: parseFloat(consultationFee) || 0,
            biography,
            availabilities: {
              create: [1,2,3,4,5].map(day => ({
                dayOfWeek: day, startTime: '09:00', endTime: '17:00'
              }))
            }
          }
        }
      },
      include: { doctor: true }
    });
    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
});

export default router;
