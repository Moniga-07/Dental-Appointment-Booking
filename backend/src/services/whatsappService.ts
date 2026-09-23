import axios from 'axios';

class WhatsAppService {
  private mode: string;
  private token: string;
  private phoneId: string;
  private baseUrl: string;

  constructor() {
    this.mode = process.env.WHATSAPP_MODE || 'DEVELOPMENT';
    this.token = process.env.WHATSAPP_TOKEN || '';
    this.phoneId = process.env.WHATSAPP_PHONE_ID || '';
    this.baseUrl = `https://graph.facebook.com/v17.0/${this.phoneId}/messages`;
  }

  async sendAppointmentConfirmationRequest(
    to: string,
    appointmentId: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string,
    clinicName: string
  ) {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: `Hello ${patientName},\n\nYour dental appointment has been booked successfully.\n\nDentist: ${doctorName}\nDate: ${date}\nTime: ${time}\nClinic: ${clinicName}\n\nPlease confirm your appointment.`
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: `CONFIRM_${appointmentId}`,
                title: "Confirm"
              }
            },
            {
              type: "reply",
              reply: {
                id: `CANCEL_${appointmentId}`,
                title: "Cancel"
              }
            }
          ]
        }
      }
    };

    if (this.mode === 'DEVELOPMENT') {
      console.log('--- WHATSAPP DEVELOPMENT MODE ---');
      console.log(`Would send to ${to}:`, JSON.stringify(payload, null, 2));
      console.log('To simulate patient clicking Confirm, send a POST request to /api/webhooks/whatsapp');
      console.log('--- END WHATSAPP LOG ---');
      return { success: true, simulated: true };
    }

    try {
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

export default new WhatsAppService();
