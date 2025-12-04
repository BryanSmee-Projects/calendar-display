import { CalendarSource } from "./types";

// Default public holiday calendars for demo purposes
export const DEFAULT_SOURCES: CalendarSource[] = [
  {
    id: 'us_holidays',
    name: 'US Holidays',
    url: 'https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics',
    color: '#3b82f6', // blue-500
    enabled: true,
  },
  {
    id: 'phases_moon',
    name: 'Phases of the Moon',
    url: 'https://calendar.google.com/calendar/ical/ht3jlfaac5lfd6263ulfh4tql8%40group.calendar.google.com/public/basic.ics',
    color: '#8b5cf6', // violet-500
    enabled: true,
  }
];

export const STORAGE_KEY_SOURCES = 'opencal_sources';
export const STORAGE_KEY_PROXY = 'opencal_proxy';
export const STORAGE_KEY_LANG = 'opencal_lang';

// A public CORS proxy is often needed for client-side fetching from external domains.
// Users can host their own or use a service like corsproxy.io
export const DEFAULT_PROXY = 'https://corsproxy.io/?';