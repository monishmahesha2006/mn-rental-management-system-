import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; 
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || twilioNumber; 
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;
export class NotificationService {
    static async sendSMS(to: string, message: string) {
        if (!client) {
            console.log(`[SMS MOCK to ${to}]: ${message}`);
            return;
        }
        try {
            await client.messages.create({
                body: message,
                from: twilioNumber,
                to: to.startsWith('+') ? to : `+91${to}` 
            });
            console.log(`SMS sent to ${to}`);
        } catch (err) {
            console.error('Failed to send SMS:', err);
        }
    }
    static async sendWhatsApp(to: string, message: string) {
        if (!client) {
            console.log(`[WhatsApp MOCK to ${to}]: ${message}`);
            return;
        }
        try {
            await client.messages.create({
                body: message,
                from: `whatsapp:${whatsappNumber}`,
                to: `whatsapp:${to.startsWith('+') ? to : `+91${to}`}`
            });
            console.log(`WhatsApp sent to ${to}`);
        } catch (err) {
            console.error('Failed to send WhatsApp:', err);
        }
    }
    static async sendReminders(tenantName: string, phone: string, amount: number, dueDate: string) {
        const text = `Dear ${tenantName}, this is a gentle reminder from BLR Rental. Your rent of ₹${amount.toLocaleString()} is due on ${dueDate}. Please settle your dues via the portal. Thank you!`;
        await this.sendSMS(phone, text);
        await this.sendWhatsApp(phone, text);
    }
}