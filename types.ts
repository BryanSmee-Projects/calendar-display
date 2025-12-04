export interface CalendarSource {
  id: string;
  name: string;
  url: string;
  color: string;
  enabled: boolean;
}

export interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  sourceId: string; // Links back to CalendarSource
}

export type ViewMode = 'month' | 'list' | 'week';

export interface CalendarState {
  sources: CalendarSource[];
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
