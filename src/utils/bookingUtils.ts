import { Appointment, DaySchedule, Service } from '../types/clinic';

/**
 * Converts "HH:mm" to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts total minutes from midnight to "HH:mm"
 */
export function minutesToTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Parses "YYYY-MM-DD" into a local Date without timezone offset shift
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formats a date into a friendly Brazilian date string (e.g. "Terça, 27 de Outubro")
 */
export function formatFriendlyDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  
  // Capitalize first letter
  const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capWeekday}, ${day} de ${month}`;
}

/**
 * Formats numbers into Brazilian currency format (R$ 180,00)
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Formats minutes into human-readable duration (e.g. "1h 15min" or "45 min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * Calculates available time slots dynamically based on service duration,
 * working hours, lunch intervals, and already booked appointments.
 */
export function calculateAvailableSlots(
  dateStr: string,
  totalDurationMinutes: number,
  specialistId: string,
  scheduleList: DaySchedule[],
  appointments: Appointment[],
  stepMinutes: number = 30
): string[] {
  if (!dateStr || totalDurationMinutes <= 0) return [];

  const localDate = parseLocalDate(dateStr);
  const dayOfWeek = localDate.getDay(); // 0 = Sun, 1 = Mon ...
  const daySchedule = scheduleList.find((s) => s.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const openMin = timeToMinutes(daySchedule.openTime);
  const closeMin = timeToMinutes(daySchedule.closeTime);
  const lunchStartMin = timeToMinutes(daySchedule.lunchStart);
  const lunchEndMin = timeToMinutes(daySchedule.lunchEnd);

  // Filter existing active appointments for this date and specialist
  const bookedIntervals = appointments
    .filter(
      (apt) =>
        apt.date === dateStr &&
        apt.status !== 'cancelled' &&
        (specialistId === 'all' || apt.specialistId === specialistId)
    )
    .map((apt) => ({
      start: timeToMinutes(apt.startTime),
      end: timeToMinutes(apt.endTime),
    }));

  const availableSlots: string[] = [];

  // Check if today: ignore slots that have already passed
  const today = new Date();
  const isToday =
    today.getFullYear() === localDate.getFullYear() &&
    today.getMonth() === localDate.getMonth() &&
    today.getDate() === localDate.getDate();
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  for (let start = openMin; start + totalDurationMinutes <= closeMin; start += stepMinutes) {
    const end = start + totalDurationMinutes;

    // If today, slot must start at least 15 mins in future
    if (isToday && start <= currentMinutes + 15) {
      continue;
    }

    // Check collision with lunch break: overlap if start < lunchEnd && end > lunchStart
    const overlapsLunch = start < lunchEndMin && end > lunchStartMin;
    if (overlapsLunch) {
      continue;
    }

    // Check collision with existing appointments
    const hasCollision = bookedIntervals.some(
      (booked) => start < booked.end && end > booked.start
    );

    if (!hasCollision) {
      availableSlots.push(minutesToTime(start));
    }
  }

  return availableSlots;
}

/**
 * Generate official WhatsApp direct link with structured booking confirmation message
 */
export function generateWhatsAppLink(
  appointment: Appointment,
  clinicPhone: string = '5511978338257'
): string {
  const serviceNames = appointment.services.map((s) => s.name).join(' + ');
  const friendlyDate = formatFriendlyDate(appointment.date);
  const totalBRL = formatCurrency(appointment.totalPrice);
  const durationText = formatDuration(appointment.totalMinutes);

  const cleanPhone = clinicPhone.replace(/\D/g, '');

  const message = `✨ *AGENDAMENTO - CLÍNICA THALIA CARVALHO* ✨
Olá, Thalia! Gostaria de confirmar meu horário agendado pelo site:

🔖 *Código:* #${appointment.code}
🗓️ *Data:* ${friendlyDate}
⏰ *Horário:* ${appointment.startTime} às ${appointment.endTime} (${durationText})
💆‍♀️ *Procedimento:* ${serviceNames}
👩‍⚕️ *Especialista:* ${appointment.specialistName}
👤 *Cliente:* ${appointment.clientName}
📱 *Telefone:* ${appointment.clientPhone}
💰 *Valor Total:* ${totalBRL}
${appointment.notes ? `📝 *Observação:* ${appointment.notes}\n` : ''}
📍 *Endereço:* Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP

Aguardo a confirmação da equipe. Muito obrigada!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate 24h Automatic Reminder WhatsApp direct link sent to client with full details
 * From clinic: 5511978338257
 */
export function generate24hReminderWhatsAppLink(
  appointment: Appointment,
  clinicPhone: string = '5511978338257',
  address: string = 'Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP'
): string {
  const serviceNames = appointment.services.map((s) => s.name).join(' + ');
  const friendlyDate = formatFriendlyDate(appointment.date);
  const totalBRL = formatCurrency(appointment.totalPrice);
  const durationText = formatDuration(appointment.totalMinutes);

  // Send to client's phone number, or to clinic if phone unavailable
  const targetPhone = appointment.clientPhone
    ? appointment.clientPhone.replace(/\D/g, '')
    : clinicPhone.replace(/\D/g, '');
  
  // Ensure Brazil country code if 10 or 11 digits
  const formattedPhone = targetPhone.length <= 11 ? `55${targetPhone}` : targetPhone;

  const reminderText = `🌸 *LEMBRETE DE AGENDAMENTO (24H ANTES) - CLÍNICA THALIA CARVALHO* 🌸
Olá, *${appointment.clientName}*! Tudo bem?

Passando para lembrar com muito carinho do seu procedimento agendado para amanhã na Clínica Thalia Carvalho:

💆‍♀️ *Procedimento(s):* ${serviceNames}
🗓️ *Data:* ${friendlyDate}
⏰ *Horário:* ${appointment.startTime} às ${appointment.endTime} (${durationText})
👩‍⚕️ *Especialista:* ${appointment.specialistName}
📍 *Local:* ${address}
💰 *Valor do Atendimento:* ${totalBRL}
🔖 *Código de Reserva:* #${appointment.code}

Por gentileza, confirme sua presença respondendo:
👉 *1* para *CONFIRMAR* sua presença
👉 *2* se precisar *REAGENDAR* ou tiver alguma dúvida

Estamos ansiosas para cuidar da sua beleza e bem-estar! ✨
WhatsApp da Clínica: (11) 97833-8257`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(reminderText)}`;
}

/**
 * Checks if appointment is within 24 hours of now (or scheduled for tomorrow)
 */
export function isAppointmentDueFor24hReminder(appointment: Appointment): boolean {
  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    return false;
  }
  if (appointment.reminderSent24h) {
    return false;
  }

  const now = new Date();
  const [year, month, day] = appointment.date.split('-').map(Number);
  const [hour, min] = appointment.startTime.split(':').map(Number);
  const aptDate = new Date(year, month - 1, day, hour, min);

  const diffHours = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Between 0 and 36 hours ahead (ideal for 24h reminder window)
  return diffHours > 0 && diffHours <= 36;
}

/**
 * Generate Google Calendar add event URL
 */
export function generateGoogleCalendarUrl(
  appointment: Appointment,
  address: string = 'Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP'
): string {
  const serviceNames = appointment.services.map((s) => s.name).join(' + ');
  const title = encodeURIComponent(`Clínica Thalia Carvalho: ${serviceNames}`);
  
  // YYYYMMDDTHHmm00
  const dateParts = appointment.date.replace(/-/g, '');
  const startParts = appointment.startTime.replace(':', '');
  const endParts = appointment.endTime.replace(':', '');

  const startIso = `${dateParts}T${startParts}00`;
  const endIso = `${dateParts}T${endParts}00`;

  const details = encodeURIComponent(
    `Agendamento #${appointment.code}\nEspecialista: ${appointment.specialistName}\nProcedimentos: ${serviceNames}\nValor: ${formatCurrency(appointment.totalPrice)}\nWhatsApp: (11) 97833-8257`
  );
  const location = encodeURIComponent(address);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

/**
 * Generates an ICS calendar file content for downloading
 */
export function generateIcsContent(
  appointment: Appointment,
  address: string = 'Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP'
): string {
  const serviceNames = appointment.services.map((s) => s.name).join(' + ');
  const dateParts = appointment.date.replace(/-/g, '');
  const startParts = appointment.startTime.replace(':', '');
  const endParts = appointment.endTime.replace(':', '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clinica Thalia Carvalho//Agendamento//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:tc-${appointment.code}@clinicathaliacarvalho.com`,
    `DTSTAMP:${dateParts}T120000Z`,
    `DTSTART:${dateParts}T${startParts}00`,
    `DTEND:${dateParts}T${endParts}00`,
    `SUMMARY:Clínica Thalia Carvalho - ${serviceNames}`,
    `DESCRIPTION:Agendamento #${appointment.code} com ${appointment.specialistName}. Procedimentos: ${serviceNames}`,
    `LOCATION:${address}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

