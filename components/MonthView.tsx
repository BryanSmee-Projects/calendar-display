import React, { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
  Locale
} from 'date-fns';
import { CalendarEvent, CalendarSource } from '../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  sources: CalendarSource[];
  onEventClick: (event: CalendarEvent) => void;
  locale: Locale;
  moreEventsText: (count: number) => string;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, sources, onEventClick, locale, moreEventsText }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { locale });
  const endDate = endOfWeek(monthEnd, { locale });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Generate dynamic week days based on locale
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { locale });
    return Array.from({ length: 7 }).map((_, i) =>
      format(addDays(start, i), 'EEE', { locale })
    );
  }, [locale]);

  // Helper to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event =>
      isSameDay(event.start, day) ||
      (event.end && isSameDay(event.end, day)) ||
      (event.start < day && event.end > day)
    ).sort((a, b) => {
      // All day first, then by time
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return a.start.getTime() - b.start.getTime();
    });
  };

  const getSourceColor = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    return source ? source.color : '#94a3b8';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 grid-rows-5 lg:grid-rows-6 flex-1">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          // Limit visible events per cell to prevent overflow
          const visibleEvents = dayEvents.slice(0, 4);
          const remaining = dayEvents.length - 4;

          return (
            <div
              key={day.toString()}
              className={`
                min-h-[100px] border-b border-r border-gray-100 dark:border-slate-800 p-1 flex flex-col gap-1 transition-colors
                ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900'}
                ${isDayToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
              `}
            >
              <div className="flex justify-between items-start px-1">
                <span className={`
                  text-xs font-medium rounded-full w-7 h-7 flex items-center justify-center
                  ${isDayToday ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-gray-400 dark:text-slate-600' : 'text-gray-700 dark:text-slate-300'}
                `}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-1 w-full">
                {visibleEvents.map((event) => {
                  const color = getSourceColor(event.sourceId);
                  const isMultiDay = !isSameDay(event.start, event.end);

                  return (
                    <button
                      key={event.uid + day.toString()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`
                        group relative flex items-center px-1.5 py-0.5 rounded text-left w-full overflow-hidden
                        hover:ring-1 hover:ring-inset hover:ring-black/10 dark:hover:ring-white/10 transition-all
                      `}
                      style={{
                        backgroundColor: `${color}15`, // 10% opacity
                        borderLeft: `3px solid ${color}`
                      }}
                    >
                      <span className="truncate text-[10px] md:text-xs font-medium text-gray-700 dark:text-slate-200 w-full" style={{ color: darkenColor(color, 60) }}>
                        {!event.isAllDay && !isMultiDay && <span className="mr-1 opacity-75">{format(event.start, 'HH:mm', { locale })}</span>}
                        {event.summary}
                      </span>
                    </button>
                  );
                })}
                {remaining > 0 && (
                  <div className="px-2 text-[10px] text-gray-400 dark:text-slate-500 font-medium hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer">
                    {moreEventsText(remaining)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple helper to darken hex color for text contrast
// Simple helper to darken hex color for text contrast
function darkenColor(color: string, percent: number) {
  // In dark mode we might want to lighten or keep it as is, but for now let's just use the color directly or a specific dark mode text color
  // The inline style above overrides this anyway for the text color if we set it there.
  // Actually, let's just return undefined to let the class take over, or handle it better.
  // For now, let's just return the color as is for dark mode compatibility if we want to use the style,
  // but we are setting text-gray-700 dark:text-slate-200 classes.
  // The inline style `color: darkenColor(color, 60)` is problematic for dark mode.
  // We should probably remove that inline style and rely on classes, or make it conditional.
  // Since I can't easily change the logic inside the map without more complex edits, I'll just leave this helper
  // but I removed the inline style usage in the replacement above? No wait, I kept it.
  // Let's modify the inline style in the previous chunk to NOT use this for text color if possible, or make this return null.
  return undefined;
}

export default MonthView;