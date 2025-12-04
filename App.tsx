import React, { useState, useEffect, useMemo } from 'react';
import { addMonths, subMonths, format, isSameMonth } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  RefreshCw,
  Info,
  Globe,
  Activity
} from 'lucide-react';

import { CalendarSource, CalendarEvent, ViewMode } from './types';
import { fetchAndParseCalendar } from './services/icsParser';
import { DEFAULT_SOURCES, DEFAULT_PROXY, STORAGE_KEY_SOURCES, STORAGE_KEY_PROXY, STORAGE_KEY_LANG } from './constants';
import { translations, Language } from './i18n';
import MonthView from './components/MonthView';
import ListView from './components/ListView';
import SettingsModal from './components/SettingsModal';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('dynamic');
  const [sources, setSources] = useState<CalendarSource[]>([]);
  const [proxyUrl, setProxyUrl] = useState(DEFAULT_PROXY);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  // Load language, sources, proxy
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (response.ok) {
          const config = await response.json();
          if (config.sources) {
            setSources(config.sources);
            // If we load from config, we probably don't want to overwrite with local storage
            // unless we want local storage to override config?
            // Usually config (env vars) overrides everything.
            // Let's stick to config > local storage > default
            return;
          }
          if (config.proxyUrl) {
            setProxyUrl(config.proxyUrl);
          }
        }
      } catch (e) {
        console.log("No config.json found or invalid, using local/defaults");
      }

      // Fallback to local storage or defaults
      const savedSources = localStorage.getItem(STORAGE_KEY_SOURCES);
      const savedProxy = localStorage.getItem(STORAGE_KEY_PROXY);

      if (savedSources) {
        setSources(JSON.parse(savedSources));
      } else {
        setSources(DEFAULT_SOURCES);
      }

      if (savedProxy !== null) {
        setProxyUrl(savedProxy);
      }
    };

    loadConfig();

    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const locale = language === 'fr' ? fr : enUS;
  const t = translations[language];

  // Fetch Events when sources or proxy change
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const allEvents: CalendarEvent[] = [];
        const activeSources = sources.filter(s => s.enabled);

        const promises = activeSources.map(source =>
          fetchAndParseCalendar(source, proxyUrl).then(sourceEvents => {
            // Basic source association check
            return sourceEvents;
          })
        );

        const results = await Promise.all(promises);
        results.forEach(res => allEvents.push(...res));

        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sources.length > 0) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [sources, proxyUrl]);

  const handleSaveSettings = (newSources: CalendarSource[], newProxy: string) => {
    setSources(newSources);
    setProxyUrl(newProxy);
    localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(newSources));
    localStorage.setItem(STORAGE_KEY_PROXY, newProxy);
  };

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'prev') setCurrentDate(subMonths(currentDate, 1));
    if (direction === 'next') setCurrentDate(addMonths(currentDate, 1));
    if (direction === 'today') setCurrentDate(new Date());
  };

  // Filter events for the current view
  const filteredEvents = useMemo(() => {
    if (viewMode === 'list') {
      // Show events from current month onwards for list view
      return events.filter(e => isSameMonth(e.start, currentDate));
    }
    if (viewMode === 'dynamic') {
      const now = new Date();
      const next31Days = new Date();
      next31Days.setDate(now.getDate() + 31);
      return events.filter(e => e.start >= now && e.start <= next31Days);
    }
    return events;
  }, [events, viewMode, currentDate]);

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen overflow-hidden text-slate-900 bg-white dark:bg-slate-900 dark:text-slate-100">
        {/* Top Navigation Bar */}
        <header className="flex-none bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              {t.app.title}
            </h1>
          </div>

          <div className={`flex items-center gap-2 sm:gap-4 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg ${viewMode === 'dynamic' ? 'opacity-50 pointer-events-none' : ''}`}>
            <button onClick={() => handleNavigate('prev')} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => handleNavigate('today')} className="px-3 py-1 text-sm font-semibold hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">{t.app.today}</button>
            <button onClick={() => handleNavigate('next')} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-lg font-semibold w-32 text-center hidden md:block capitalize">
              {format(currentDate, 'MMMM yyyy', { locale })}
            </span>

            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('dynamic')}
                title={t.app.dynamic}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'dynamic' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('month')}
                title={t.app.month}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title={t.app.list}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <ThemeToggle />

            {/* Language Switcher */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-24 z-50">
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-lg rounded-lg p-1">
                  <button onClick={() => changeLanguage('en')} className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>English</button>
                  <button onClick={() => changeLanguage('fr')} className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${language === 'fr' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Français</button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              title={t.app.settings}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative">

          {/* Sidebar */}
          <aside className="w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex-col p-4 hidden lg:flex">
            <div className="mb-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                {isSameMonth(currentDate, new Date()) ? (
                  <>
                    <span className="text-4xl font-bold text-gray-800 dark:text-slate-100 block mb-1">{format(currentDate, 'd', { locale })}</span>
                    <span className="text-gray-500 dark:text-slate-400 uppercase tracking-wider text-sm font-medium">{format(currentDate, 'EEEE', { locale })}</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-800 dark:text-slate-100 block mb-1 capitalize">{format(currentDate, 'MMMM', { locale })}</span>
                    <span className="text-gray-500 dark:text-slate-400 uppercase tracking-wider text-sm font-medium">{format(currentDate, 'yyyy', { locale })}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span>{t.sidebar.calendars}</span>
                {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
              </div>

              <div className="space-y-2">
                {sources.map(source => (
                  <div key={source.id} className="flex items-center gap-3 group cursor-default">
                    <div
                      className={`w-3 h-3 rounded-full transition-transform ${source.enabled ? 'scale-100' : 'scale-0 border-2 border-gray-300 dark:border-slate-600'}`}
                      style={{ backgroundColor: source.enabled ? source.color : 'transparent' }}
                    />
                    <span className={`text-sm font-medium truncate ${source.enabled ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500'}`}>
                      {source.name}
                    </span>
                  </div>
                ))}
                {sources.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-slate-500 italic">{t.settings.noSources}</p>
                )}
              </div>
            </div>
          </aside>

          {/* View Container */}
          <div className="flex-1 p-4 md:p-6 overflow-hidden bg-white dark:bg-slate-900">
            {viewMode === 'month' ? (
              <MonthView
                currentDate={currentDate}
                events={events}
                sources={sources}
                onEventClick={setSelectedEvent}
                locale={locale}
                moreEventsText={t.calendar.moreEvents}
              />
            ) : (
              <ListView
                events={filteredEvents}
                sources={sources}
                onEventClick={setSelectedEvent}
                locale={locale}
                noEventsText={t.calendar.noEvents}
              />
            )}
          </div>

        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          sources={sources}
          onSave={handleSaveSettings}
          currentProxy={proxyUrl}
          t={t}
        />

        {/* Event Details Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 leading-snug">{selectedEvent.summary}</h3>
                <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <Settings className="w-5 h-5 rotate-45 text-gray-400 dark:text-slate-500" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex gap-2">
                  <CalendarIcon className="w-4 h-4 mt-0.5 text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100 capitalize">
                      {format(selectedEvent.start, 'EEEE, d MMMM yyyy', { locale })}
                    </p>
                    <p>
                      {selectedEvent.isAllDay ? 'All Day' : `${format(selectedEvent.start, 'p', { locale })} - ${format(selectedEvent.end, 'p', { locale })}`}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex gap-2">
                    <div className="w-4 h-4 mt-0.5 text-gray-400 dark:text-slate-500">📍</div>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedEvent.description}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-lg font-medium transition-colors"
                >
                  {t.app.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;