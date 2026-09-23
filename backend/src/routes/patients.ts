import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Patient dashboard stats
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const patient = await prisma.profilePatient.findUnique({
      where: { userId },
      include: {
        appointments: {
          include: { doctor: { include: { user: { select: { name: true } } } }, service: true },
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    if (!patient) {
      res.status(403).json({ success: false, message: 'Not a patient' });
      return;
    }

    res.json({ success: true, dashboard: { patient } });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { name, phone, whatsappNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone }
    });

    const updatedPatient = await prisma.profilePatient.update({
      where: { userId },
      data: { whatsappNumber }
    });

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
});

export default router;
