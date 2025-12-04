import React, { useState } from 'react';
import { CalendarSource } from '../types';
import { X, Plus, Trash2, Save, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: CalendarSource[];
  onSave: (sources: CalendarSource[], proxy: string) => void;
  currentProxy: string;
  t: any; // Using any for simplicity in props, ideally strongly typed from translations
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, sources, onSave, currentProxy, t }) => {
  const [localSources, setLocalSources] = useState<CalendarSource[]>(sources);
  const [proxyUrl, setProxyUrl] = useState(currentProxy);

  if (!isOpen) return null;

  const handleAddSource = () => {
    setLocalSources([
      ...localSources,
      {
        id: crypto.randomUUID(),
        name: 'New Calendar',
        url: '',
        color: '#10b981',
        enabled: true
      }
    ]);
  };

  const handleUpdateSource = (id: string, field: keyof CalendarSource, value: any) => {
    setLocalSources(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleRemoveSource = (id: string) => {
    setLocalSources(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSave(localSources, proxyUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.settings.title}</h2>
            <p className="text-sm text-gray-500">{t.settings.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Calendar List */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t.settings.sources}</h3>
              <button 
                onClick={handleAddSource}
                className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> {t.app.addSource}
              </button>
            </div>

            <div className="space-y-4">
              {localSources.map((source) => (
                <div key={source.id} className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-all">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={source.color}
                          onChange={(e) => handleUpdateSource(source.id, 'color', e.target.value)}
                          className="h-9 w-9 p-1 rounded cursor-pointer border border-gray-200"
                          title="Calendar Color"
                        />
                        <input 
                          type="text" 
                          value={source.name}
                          onChange={(e) => handleUpdateSource(source.id, 'name', e.target.value)}
                          placeholder={t.settings.calendarNamePlaceholder}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <input 
                        type="url" 
                        value={source.url}
                        onChange={(e) => handleUpdateSource(source.id, 'url', e.target.value)}
                        placeholder={t.settings.urlPlaceholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveSource(source.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove Calendar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {localSources.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  {t.settings.noSources}
                </div>
              )}
            </div>
          </section>

          {/* Advanced Settings */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{t.settings.corsTitle}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {t.settings.corsDesc}
            </p>
            <input 
              type="text" 
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="https://corsproxy.io/?"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t.app.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> {t.app.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;