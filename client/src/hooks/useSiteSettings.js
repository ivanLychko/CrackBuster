import { useState, useEffect } from 'react';
import { useServerData } from '../contexts/ServerDataContext';

const getDefaultSettings = () => ({
  phone: '(780) XXX-XXXX',
  email: 'info@crackbuster.ca',
  address: 'Edmonton, Alberta, Canada',
  serviceArea: 'Edmonton and surrounding areas',
  secondaryPhone: '',
  secondaryEmail: '',
  businessHours: '',
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  youtube: '',
  allowIndexing: true
});

const useSiteSettings = () => {
  // Get data from server context (SSR) or window (client hydration)
  const serverData = useServerData();
  const clientData = typeof window !== 'undefined' && window.__INITIAL_STATE__;
  const initialSettings = serverData?.siteSettings || clientData?.siteSettings || null;

  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have settings from SSR, skip fetching
    if (initialSettings) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        } else {
          // Fallback to default values if no settings found
          setSettings(getDefaultSettings());
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err);
        // Fallback to default values on error
        setSettings(getDefaultSettings());
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [initialSettings]);

  return { settings, loading, error };
};

export default useSiteSettings;




