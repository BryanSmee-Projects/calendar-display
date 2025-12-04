import { CalendarEvent, CalendarSource } from '../types';
import { addDays, parse, parseISO } from 'date-fns';

// Helper to unfold lines (ICS standard: lines starting with space are continuations)
const unfold = (text: string): string => {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
};

// Helper to parse ICS date strings
const parseICSDate = (dateStr: string): { date: Date; isAllDay: boolean } => {
  if (!dateStr) return { date: new Date(), isAllDay: false };

  // Clean format: Remove TZID prefix if present (simplified handling)
  const cleanStr = dateStr.split(';').pop()?.split(':').pop() || '';

  // Pattern for YYYYMMDD
  const dateOnlyRegex = /^(\d{4})(\d{2})(\d{2})$/;
  // Pattern for YYYYMMDDTHHmmssZ or YYYYMMDDTHHmmss
  const dateTimeRegex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/;

  if (dateOnlyRegex.test(cleanStr)) {
    // All day event
    const match = cleanStr.match(dateOnlyRegex);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return { date: new Date(year, month, day), isAllDay: true };
    }
  }

  if (dateTimeRegex.test(cleanStr)) {
    const match = cleanStr.match(dateTimeRegex);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const hour = parseInt(match[4], 10);
      const minute = parseInt(match[5], 10);
      const second = parseInt(match[6], 10);
      const isUTC = match[7] === 'Z';

      const date = new Date(Date.UTC(year, month, day, hour, minute, second));

      if (!isUTC) {
        // If not UTC, treat as local (simplified) or adjust offset. 
        // For a simple viewer, interpreting as local time usually matches user expectation for floating events.
        return { date: new Date(year, month, day, hour, minute, second), isAllDay: false };
      }
      return { date, isAllDay: false };
    }
  }

  // Fallback
  return { date: new Date(), isAllDay: false };
};

const unescapeText = (text: string): string => {
  return text
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\[nN]/g, '\n')
    .replace(/\\\\/g, '\\');
};

export const fetchAndParseCalendar = async (source: CalendarSource, _proxyUrl: string = ''): Promise<CalendarEvent[]> => {
  try {
    // Use internal API to proxy requests and hide tokens
    let apiUrl = '/api/calendar';
    if (source.url) {
      apiUrl += `?url=${encodeURIComponent(source.url)}`;
    } else {
      apiUrl += `?id=${source.id}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.name}`);
    }

    const text = await response.text();
    const unfolded = unfold(text);
    const lines = unfolded.split(/\r\n|\n/);

    const events: CalendarEvent[] = [];
    let inEvent = false;
    let currentEvent: Partial<CalendarEvent> = {};
    let tempStart: string | null = null;
    let tempEnd: string | null = null;

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = { sourceId: source.id, uid: crypto.randomUUID() };
        tempStart = null;
        tempEnd = null;
      } else if (line.startsWith('END:VEVENT')) {
        inEvent = false;
        if (tempStart) {
          const { date: start, isAllDay } = parseICSDate(tempStart);
          let end: Date;

          if (tempEnd) {
            const parsedEnd = parseICSDate(tempEnd);
            end = parsedEnd.date;
          } else {
            // Default duration 1 hour if no end
            end = addDays(start, isAllDay ? 1 : 0);
            if (!isAllDay) end.setHours(start.getHours() + 1);
          }

          events.push({
            uid: currentEvent.uid || crypto.randomUUID(),
            summary: currentEvent.summary || 'No Title',
            description: currentEvent.description || '',
            location: currentEvent.location || '',
            start,
            end,
            isAllDay,
            sourceId: source.id,
          });
        }
      } else if (inEvent) {
        const [keyRaw, ...rest] = line.split(':');
        const value = rest.join(':');
        // Handle parameters like DTSTART;VALUE=DATE:20230101
        const [key] = keyRaw.split(';');

        switch (key) {
          case 'SUMMARY':
            currentEvent.summary = unescapeText(value);
            break;
          case 'DESCRIPTION':
            currentEvent.description = unescapeText(value);
            break;
          case 'LOCATION':
            currentEvent.location = unescapeText(value);
            break;
          case 'DTSTART':
            tempStart = value || keyRaw.split(':')[1]; // Fallback for simple split
            // If the keyRaw contained the value due to split error (rare in standard ICS but possible in malformed)
            if (!tempStart && line.includes('DTSTART')) tempStart = line.substring(line.indexOf(':') + 1);

            // Check for VALUE=DATE in the original key part
            if (keyRaw.includes('VALUE=DATE')) {
              // It's handled inside parseICSDate by regex logic looking for lack of T
            }
            break;
          case 'DTEND':
            tempEnd = value;
            if (!tempEnd && line.includes('DTEND')) tempEnd = line.substring(line.indexOf(':') + 1);
            break;
        }
      }
    }

    return events;
  } catch (err) {
    console.error(`Error parsing calendar ${source.name}`, err);
    return [];
  }
};
