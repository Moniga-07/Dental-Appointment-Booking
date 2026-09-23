import { Router } from 'express';
import prisma from '../utils/prisma';
import { AppointmentStatus } from '@prisma/client';

const router = Router();

router.get('/whatsapp', (req, res) => {
  const verify_token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

router.post('/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        
        if (message.type === 'interactive' && message.interactive) {
          const buttonReply = message.interactive.button_reply;
          if (buttonReply) {
            const payload = buttonReply.id;
            
            let action = '';
            let appointmentId = '';
            
            if (payload.startsWith('CONFIRM_')) {
              action = 'CONFIRM';
              appointmentId = payload.replace('CONFIRM_', '');
            } else if (payload.startsWith('CANCEL_')) {
              action = 'CANCEL';
              appointmentId = payload.replace('CANCEL_', '');
            }

            if (appointmentId && (action === 'CONFIRM' || action === 'CANCEL')) {
              const apt = await prisma.appointment.findUnique({
                where: { id: appointmentId }
              });

              if (apt && apt.status === 'PENDING_CONFIRMATION') {
                const newStatus = action === 'CONFIRM' ? AppointmentStatus.CONFIRMED : AppointmentStatus.CANCELLED;
                
                await prisma.appointment.update({
                  where: { id: appointmentId },
                  data: { status: newStatus }
                });

                console.log(`Appointment ${appointmentId} updated to ${newStatus} via WhatsApp webhook`);
              }
            }
          }
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

export default router;
