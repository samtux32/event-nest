/**
 * Generate an ICS calendar file string from event data.
 * No external dependencies — ICS is a simple text format.
 */

function escapeICSText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function padTwo(n) {
  return String(n).padStart(2, '0');
}

function formatDateYMD(date) {
  return `${date.getFullYear()}${padTwo(date.getMonth() + 1)}${padTwo(date.getDate())}`;
}

function generateUID() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < 24; i++) {
    uid += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${uid}@eventnest`;
}

/**
 * @param {Object} params
 * @param {string} params.title - Event title
 * @param {string} [params.description] - Event description
 * @param {string} [params.location] - Event location
 * @param {Date} params.startDate - Event date
 * @param {string} [params.startTime] - "HH:mm" format (optional — omit for all-day event)
 * @param {string} [params.endTime] - "HH:mm" format (optional — defaults to startTime + 2hrs)
 * @param {string} [params.organizerName] - Organizer display name
 * @param {string} [params.organizerEmail] - Organizer email
 * @returns {string} ICS file content
 */
export function generateICS({ title, description, location, startDate, startTime, endTime, organizerName, organizerEmail }) {
  const now = new Date();
  const timestamp = `${formatDateYMD(now)}T${padTwo(now.getHours())}${padTwo(now.getMinutes())}${padTwo(now.getSeconds())}`;

  let dtStart, dtEnd;

  if (startTime) {
    // Timed event
    const [startH, startM] = startTime.split(':').map(Number);
    dtStart = `DTSTART:${formatDateYMD(startDate)}T${padTwo(startH)}${padTwo(startM)}00`;

    let endH, endM;
    if (endTime) {
      [endH, endM] = endTime.split(':').map(Number);
    } else {
      // Default to startTime + 2 hours
      endH = startH + 2;
      endM = startM;
      if (endH >= 24) endH = 23;
    }
    dtEnd = `DTEND:${formatDateYMD(startDate)}T${padTwo(endH)}${padTwo(endM)}00`;
  } else {
    // All-day event
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    dtStart = `DTSTART;VALUE=DATE:${formatDateYMD(startDate)}`;
    dtEnd = `DTEND;VALUE=DATE:${formatDateYMD(nextDay)}`;
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event Nest//Event Nest//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTAMP:${timestamp}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeICSText(title)}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${escapeICSText(description)}`);
  }

  if (location) {
    lines.push(`LOCATION:${escapeICSText(location)}`);
  }

  if (organizerName && organizerEmail) {
    lines.push(`ORGANIZER;CN=${escapeICSText(organizerName)}:mailto:${organizerEmail}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
