import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

const sendgridKey = process.env.SENDGRID_API_KEY;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

if (sendgridKey) {
  sgMail.setApiKey(sendgridKey);
}

let twilioClient = null;
if (twilioSid && twilioToken) {
  twilioClient = twilio(twilioSid, twilioToken);
}

export async function sendEmail({ to, subject, text, html }) {
  if (!sendgridKey) {
    console.log(`[EMAIL MOCK] To: ${to}\nSubject: ${subject}\n${text}`);
    return { mock: true };
  }

  try {
    await sgMail.send({
      to,
      from: 'bookings@xpressmen.com',
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('SendGrid error:', err.message);
    return { sent: false, error: err.message };
  }
}

export async function sendSMS({ to, body }) {
  if (!twilioClient) {
    console.log(`[SMS MOCK] To: ${to}\n${body}`);
    return { mock: true };
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: twilioPhone,
      to,
    });
    return { sent: true, sid: message.sid };
  } catch (err) {
    console.error('Twilio error:', err.message);
    return { sent: false, error: err.message };
  }
}

export async function notifyCustomerOnBooking(order) {
  const { contactInfo, reference, schedule, pricing } = order;
  if (!contactInfo) return;

  const subject = `Your Xpressmen booking is confirmed — ${reference}`;
  const text = `Hi ${contactInfo.firstName},\n\nYour booking ${reference} is confirmed.\nScheduled: ${schedule?.date || 'TBD'} at ${schedule?.timeSlot || 'TBD'}\nTotal: $${pricing?.total?.toFixed(2)}\n\nTrack your order: https://xpressmen.com/track/${reference}`;

  await sendEmail({ to: contactInfo.email, subject, text });
  await sendSMS({ to: contactInfo.phone, body: `Xpressmen: Booking ${reference} confirmed for ${schedule?.date || 'TBD'}. Track: xpressmen.com/track/${reference}` });
}

export async function notifyCustomerOnStatusChange(order, status, note) {
  const { contactInfo, reference } = order;
  if (!contactInfo) return;

  const statusLabels = {
    confirmed: 'confirmed',
    scheduled: 'scheduled',
    dispatched: 'dispatched',
    in_transit: 'on the way',
    delivered: 'delivered',
    completed: 'completed',
    cancelled: 'cancelled',
  };

  const label = statusLabels[status] || status;
  const text = `Hi ${contactInfo.firstName},\n\nYour order ${reference} is now ${label}.${note ? `\nNote: ${note}` : ''}\n\nTrack: https://xpressmen.com/track/${reference}`;

  await sendEmail({ to: contactInfo.email, subject: `Order ${reference} — ${label}`, text });
  await sendSMS({ to: contactInfo.phone, body: `Xpressmen: Order ${reference} is ${label}.` });
}
