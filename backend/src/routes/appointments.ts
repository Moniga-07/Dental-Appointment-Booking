import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middlewares/auth';
import { z } from 'zod';
import whatsappService from '../services/whatsappService';
import { parseISO, getDay, addMinutes, format, isBefore } from 'date-fns';

const router = Router();

router.get('/available-slots', async (req, res, next) => {
  try {
    const { doctorId, date, serviceId } = req.query;
    if (!doctorId || !date || !serviceId) {
      res.status(400).json({ success: false, message: 'Missing parameters' });
      return;
    }

    const targetDate = parseISO(date as string);
    const dayOfWeek = getDay(targetDate);
    
    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctorId as string, dayOfWeek, isActive: true }
    });

    if (!availability) {
      res.json({ success: true, slots: [] });
      return;
    }

    const doctorBreaks = await prisma.doctorBreak.findMany({
      where: { doctorId: doctorId as string, dayOfWeek }
    });

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId as string,
        date: targetDate,
        status: {
          not: 'CANCELLED'
        }
      }
    });

    const service = await prisma.service.findUnique({
      where: { id: serviceId as string }
    });

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    const duration = service.duration;

    const slots = [];
    let currentStartTime = new Date(`${date}T${availability.startTime}:00`);
    const endTime = new Date(`${date}T${availability.endTime}:00`);

    const now = new Date();

    while (currentStartTime < endTime) {
      let currentEndTime = addMinutes(currentStartTime, duration);
      if (currentEndTime > endTime) break;

      const slotStartStr = format(currentStartTime, 'HH:mm');
      const slotEndStr = format(currentEndTime, 'HH:mm');

      if (isBefore(currentStartTime, now)) {
        currentStartTime = addMinutes(currentStartTime, duration);
        continue;
      }

      const isDuringBreak = doctorBreaks.some(br => {
        return (slotStartStr >= br.startTime && slotStartStr < br.endTime) ||
               (slotEndStr > br.startTime && slotEndStr <= br.endTime) ||
               (slotStartStr <= br.startTime && slotEndStr >= br.endTime);
      });

      const isBooked = existingAppointments.some(apt => {
        return (slotStartStr >= apt.startTime && slotStartStr < apt.endTime) ||
               (slotEndStr > apt.startTime && slotEndStr <= apt.endTime) ||
               (slotStartStr <= apt.startTime && slotEndStr >= apt.endTime);
      });

      if (!isDuringBreak && !isBooked) {
        slots.push({ startTime: slotStartStr, endTime: slotEndStr });
      }

      currentStartTime = addMinutes(currentStartTime, duration);
    }

    res.json({ success: true, slots });
  } catch (error) {
    next(error);
  }
});

const bookSchema = z.object({
  doctorId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  startTime: z.string(),
});

router.post('/book', authenticate, async (req, res, next) => {
  try {
    const { doctorId, serviceId, date, startTime } = bookSchema.parse(req.body);
    const userId = req.user!.userId;

    const patient = await prisma.profilePatient.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!patient) {
      res.status(403).json({ success: false, message: 'Only patients can book appointments' });
      return;
    }

    const doctor = await prisma.profileDoctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!doctor || !service) {
      res.status(404).json({ success: false, message: 'Doctor or Service not found' });
      return;
    }

    const targetDate = parseISO(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDateTime = addMinutes(new Date(targetDate).setHours(hours, minutes, 0, 0), service.duration);
    const endTimeStr = format(endDateTime, 'HH:mm');

    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const existing = await tx.appointment.findFirst({
          where: {
            doctorId,
            date: targetDate,
            status: { not: 'CANCELLED' },
            OR: [
              { startTime: { lte: startTime }, endTime: { gt: startTime } },
              { startTime: { lt: endTimeStr }, endTime: { gte: endTimeStr } }
            ]
          }
        });

        if (existing) {
          throw new Error('SLOT_TAKEN');
        }

        const count = await tx.appointment.count();
        const aptId = `APT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

        return await tx.appointment.create({
          data: {
            appointmentId: aptId,
            patientId: patient.id,
            doctorId,
            serviceId,
            date: targetDate,
            startTime,
            endTime: endTimeStr,
            status: 'PENDING_CONFIRMATION'
          }
        });
      });

      let phone = patient.whatsappNumber || patient.user.phone;
      if (phone) {
        phone = phone.replace(/\D/g, '');
        await whatsappService.sendAppointmentConfirmationRequest(
          phone,
          appointment.id,
          patient.user.name,
          doctor.user.name,
          date,
          startTime,
          'Main Clinic'
        );
      }

      res.status(201).json({ success: true, appointment });
    } catch (err: any) {
      if (err.message === 'SLOT_TAKEN') {
        res.status(409).json({ success: false, message: 'This slot has already been booked. Please choose another one.' });
        return;
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

router.get('/my-appointments', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const patient = await prisma.profilePatient.findUnique({ where: { userId } });
    
    if (!patient) {
      res.status(403).json({ success: false, message: 'Not a patient' });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
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

export default router;
