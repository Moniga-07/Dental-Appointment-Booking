import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

// Get all active doctors (Public)
router.get('/', async (req, res, next) => {
  try {
    const doctors = await prisma.profileDoctor.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });
    res.json({ success: true, doctors });
  } catch (error) {
    next(error);
  }
});

// Get a specific doctor by ID (Public)
router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await prisma.profileDoctor.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        availabilities: true,
        breaks: true,
      }
    });

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
});

// Protected Doctor routes
router.use(authenticate, authorizeRoles('DOCTOR'));

router.get('/me/appointments', async (req, res, next) => {
  try {
    const doctorProfile = await prisma.profileDoctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
        service: true
      },
      orderBy: [ { date: 'asc' }, { startTime: 'asc' } ]
    });
    res.json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
});

router.patch('/me/appointments/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;
    const doctorProfile = await prisma.profileDoctor.findUnique({ where: { userId: req.user!.userId } });
    
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId, doctorId: doctorProfile.id },
      data: { status }
    });

    res.json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
});

export default router;
