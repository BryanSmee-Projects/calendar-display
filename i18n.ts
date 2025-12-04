export type Language = 'en' | 'fr';

export const translations = {
  en: {
    app: {
      title: 'OpenCal',
      today: 'Today',
      month: 'Month',
      list: 'List',
      settings: 'Settings',
      addSource: 'Add Source',
      save: 'Save Changes',
      cancel: 'Cancel',
      language: 'Language',
      close: 'Close',
    },
    calendar: {
      noEvents: 'No events found for the selected period.',
      moreEvents: (count: number) => `+${count} more`,
    },
    settings: {
      title: 'Calendar Settings',
      subtitle: 'Manage your subscription URLs',
      sources: 'Sources',
      corsTitle: 'Advanced: CORS Proxy',
      corsDesc: 'Browsers block requests to other domains by default. Use a CORS proxy to bypass this.',
      noSources: 'No calendars added.',
      calendarNamePlaceholder: 'Calendar Name',
      urlPlaceholder: 'https://example.com/calendar.ics',
    },
    sidebar: {
        calendars: 'Calendars',
        infoText: 'Add your public .ics links in settings. Ensure CORS is handled if fetching fails.',
    }
  },
  fr: {
    app: {
      title: 'OpenCal',
      today: "Aujourd'hui",
      month: 'Mois',
      list: 'Liste',
      settings: 'Paramètres',
      addSource: 'Ajouter',
      save: 'Enregistrer',
      cancel: 'Annuler',
      language: 'Langue',
      close: 'Fermer',
    },
    calendar: {
      noEvents: 'Aucun événement trouvé pour la période sélectionnée.',
      moreEvents: (count: number) => `+${count} autres`,
    },
    settings: {
      title: 'Paramètres du calendrier',
      subtitle: "Gérer vos URL d'abonnement",
      sources: 'Sources',
      corsTitle: 'Avancé : Proxy CORS',
      corsDesc: 'Les navigateurs bloquent les requêtes vers d\'autres domaines par défaut. Utilisez un proxy CORS pour contourner cela.',
      noSources: 'Aucun calendrier ajouté.',
      calendarNamePlaceholder: 'Nom du calendrier',
      urlPlaceholder: 'https://exemple.com/calendrier.ics',
    },
    sidebar: {
        calendars: 'Calendriers',
        infoText: 'Ajoutez vos liens .ics publics dans les paramètres. Assurez-vous que CORS est géré si la récupération échoue.',
    }
  }
};