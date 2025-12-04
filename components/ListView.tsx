import React from 'react';
import { CalendarEvent, CalendarSource } from '../types';
import { format, isSameDay, startOfDay, Locale } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

interface ListViewProps {
  events: CalendarEvent[];
  sources: CalendarSource[];
  onEventClick: (event: CalendarEvent) => void;
  locale: Locale;
  noEventsText: string;
}

const ListView: React.FC<ListViewProps> = ({ events, sources, onEventClick, locale, noEventsText }) => {
  // Sort events strictly by start time
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Group by day
  const grouped: Record<string, CalendarEvent[]> = {};
  sortedEvents.forEach(event => {
    const key = startOfDay(event.start).toISOString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  });

  const getSource = (id: string) => sources.find(s => s.id === id);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="overflow-y-auto p-6 space-y-8 h-full">
        {Object.entries(grouped).map(([dateStr, dayEvents]) => {
          const date = new Date(dateStr);
          return (
            <div key={dateStr} className="flex gap-6">
              <div className="flex flex-col items-center w-16 pt-1 flex-shrink-0">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{format(date, 'EEE', { locale })}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">{format(date, 'd', { locale })}</span>
              </div>

              <div className="flex-1 space-y-3">
                {dayEvents.map(event => {
                  const source = getSource(event.sourceId);
                  return (
                    <div
                      key={event.uid}
                      onClick={() => onEventClick(event)}
                      className="group flex flex-col sm:flex-row gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-800"
                      style={{ borderLeft: `4px solid ${source?.color || '#ccc'}` }}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100">{event.summary}</h4>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.isAllDay ? 'All Day' : `${format(event.start, 'h:mm a', { locale })} - ${format(event.end, 'h:mm a', { locale })}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {source && (
                        <div className="flex items-center">
                          <span
                            className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-opacity-10"
                            style={{ backgroundColor: `${source.color}20`, color: source.color }}
                          >
                            {source.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-slate-600">
            {noEventsText}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;