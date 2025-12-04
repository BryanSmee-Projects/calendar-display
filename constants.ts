import { CalendarSource } from "./types";

// Default public holiday calendars for demo purposes
// Default public holiday calendars for demo purposes
export const DEFAULT_SOURCES: CalendarSource[] = [];

export const STORAGE_KEY_SOURCES = 'opencal_sources';
export const STORAGE_KEY_PROXY = 'opencal_proxy';
export const STORAGE_KEY_LANG = 'opencal_lang';

// A public CORS proxy is often needed for client-side fetching from external domains.
// Users can host their own or use a service like corsproxy.io
export const DEFAULT_PROXY = 'https://corsproxy.io/?';