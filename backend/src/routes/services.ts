import { Router } from 'express';
import prisma from '../utils/prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true }
    });
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
});

export default router;
